function firstDefined(keys: string[]): string | null {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return null;
}

/** Evita trailing slash y URLs mal copiadas que rompen el cliente Auth. */
export function normalizeSupabaseUrl(url: string): string {
  let u = url.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  return u;
}

const SUPABASE_URL_KEYS = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"];
const SUPABASE_ANON_KEYS = [
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_ANON_KEY",
];
const SUPABASE_SERVICE_KEYS = ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"];

export function getEnv() {
  const rawUrl = firstDefined(SUPABASE_URL_KEYS);
  const anonKey = firstDefined(SUPABASE_ANON_KEYS);
  const url = rawUrl ? normalizeSupabaseUrl(rawUrl) : null;

  if (!url || !anonKey) {
    throw new Error(
      `Missing Supabase environment variables. Expected URL in [${SUPABASE_URL_KEYS.join(
        ", ",
      )}] and anon key in [${SUPABASE_ANON_KEYS.join(", ")}]`,
    );
  }

  return { url, anonKey };
}

export function getEnvOrNull() {
  const rawUrl = firstDefined(SUPABASE_URL_KEYS);
  const anonKey = firstDefined(SUPABASE_ANON_KEYS);
  if (!rawUrl || !anonKey) return null;
  return { url: normalizeSupabaseUrl(rawUrl), anonKey };
}

export function getServiceRoleKey(): string {
  const key = firstDefined(SUPABASE_SERVICE_KEYS);
  if (!key) {
    throw new Error(
      `Missing Supabase service role key. Expected one of [${SUPABASE_SERVICE_KEYS.join(", ")}]`,
    );
  }
  return key;
}
