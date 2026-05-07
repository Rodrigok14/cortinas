import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { getEnvOrNull } from "@/lib/env";
import { fetchWithRetry } from "@/lib/supabase/fetch-retry";

export async function updateSession(request: NextRequest, response: NextResponse) {
  const env = getEnvOrNull();

  if (!env) {
    return response;
  }

  const supabase = createServerClient(env.url, env.anonKey, {
    global: { fetch: fetchWithRetry },
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value;
      },
      set(name, value, options) {
        request.cookies.set({ name, value, ...options });
        response.cookies.set({ name, value, ...options });
      },
      remove(name, options) {
        request.cookies.set({ name, value: "", ...options });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}
