import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getLeads(search?: string) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("leads")
    .select("id, nombre, telefono, email, ciudad, fuente, estado, prioridad, created_at")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`nombre.ilike.%${search}%,telefono.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

