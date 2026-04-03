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
        cookieStore.set({ name, value, ...options });
      },
      remove(name, options) {
        cookieStore.set({ name, value: "", ...options });
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
