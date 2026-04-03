"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations";

export async function loginAction(formData: FormData): Promise<void> {
  const data = loginSchema.parse({
    email: formData.get("email")?.toString(),
    password: formData.get("password")?.toString(),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const supabase = getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
