import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getClients(search?: string) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `nombre_completo.ilike.%${search}%,telefono.ilike.%${search}%,email.ilike.%${search}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}
