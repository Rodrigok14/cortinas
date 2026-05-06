import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { getEnv, getServiceRoleKey } from "@/lib/env";

export function getSupabaseServerClient() {
  const cookieStore = cookies();
  const { url, anonKey } = getEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        // In Server Components, Next.js may forbid cookie writes.
        // Middleware/Server Actions handle persisted cookie updates safely.
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // no-op
        }
      },
      remove(name, options) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // no-op
        }
      },
    },
  });
}

export function getSupabaseAdminClient() {
  const { url } = getEnv();
  const serviceRoleKey = getServiceRoleKey();

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
