"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getEnv } from "@/lib/env";
import { fetchWithRetry } from "@/lib/supabase/fetch-retry";

let client: ReturnType<typeof createBrowserClient> | undefined;

export function getSupabaseBrowserClient() {
  if (!client) {
    const { url, anonKey } = getEnv();
    client = createBrowserClient(url, anonKey, {
      cookies: {},
      global: { fetch: fetchWithRetry },
    });
  }
  return client;
}
