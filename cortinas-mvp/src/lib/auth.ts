import { redirect } from "next/navigation";
import { canAccess, Role } from "@/lib/roles";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type UserProfile = {
  userId: string;
  email: string;
  fullName: string | null;
  role: Role;
};

export async function requireAuth(): Promise<UserProfile> {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? "vendedor") as Role;

  return {
    userId: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name ?? null,
    role,
  };
}

export async function requireModuleAccess(moduleKey: string): Promise<UserProfile> {
  const profile = await requireAuth();

  if (!canAccess(profile.role, moduleKey)) {
    redirect("/dashboard?error=No tienes permisos para este modulo");
  }

  return profile;
}
