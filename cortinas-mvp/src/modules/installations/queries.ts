import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getInstallations(search?: string) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("installations")
    .select("*, projects(nombre_obra)")
    .order("fecha_programada", { ascending: true });

  if (search) {
    query = query.or(`tecnico.ilike.%${search}%,estado.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}
