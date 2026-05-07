/**
 * Reintentos breves ante cortes TLS/red (UND_ERR_SOCKET, ECONNRESET) que a veces
 * aparecen con undici/Node hacia Supabase detrás de Cloudflare, VPN o IPv6 roto.
 */
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 250;

function isRetriableFetchError(err: unknown): boolean {
  if (!(err instanceof TypeError)) return false;
  const msg = String(err.message ?? "").toLowerCase();
  if (msg.includes("fetch failed")) return true;
  const cause = err.cause;
  if (cause && typeof cause === "object" && "code" in cause) {
    const code = String((cause as { code?: string }).code ?? "");
    return ["UND_ERR_SOCKET", "ECONNRESET", "ETIMEDOUT", "ECONNREFUSED", "ENOTFOUND"].includes(code);
  }
  return false;
}

export function fetchWithRetry(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const run = async (attempt: number): Promise<Response> => {
    try {
      return await fetch(input, init);
    } catch (err) {
      if (attempt < MAX_ATTEMPTS && isRetriableFetchError(err)) {
        await new Promise((r) => setTimeout(r, BASE_DELAY_MS * attempt));
        return run(attempt + 1);
      }
      throw err;
    }
  };
  return run(1);
}
