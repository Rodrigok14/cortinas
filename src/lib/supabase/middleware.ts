import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

export function updateSession(request: NextRequest, response: NextResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
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

  supabase.auth.getSession();
  return response;
}
