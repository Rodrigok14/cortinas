import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getProjects(search?: string) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("projects")
    .select("*, clients(nombre_completo)")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`nombre_obra.ilike.%${search}%,direccion_instalacion.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getProjectOptions() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, nombre_obra")
    .order("nombre_obra");

  if (error) throw new Error(error.message);
  return data ?? [];
}
