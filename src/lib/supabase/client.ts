"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getEnv } from "@/lib/env";

let client: ReturnType<typeof createBrowserClient> | undefined;

export function getSupabaseBrowserClient() {
  if (!client) {
    const { url, anonKey } = getEnv();
    client = createBrowserClient(url, anonKey);
  }
  return client;
}
