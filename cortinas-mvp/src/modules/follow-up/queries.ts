import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getFollowUpBudgets(search?: string) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("quotations")
    .select(`
      id,
      client_id,
      project_id,
      numero,
      fecha,
      estado,
      total,
      saldo,
      anticipo_requerido,
      observaciones,
      created_at,
      clients(nombre_completo, telefono, email, direccion),
      projects(nombre_obra, direccion_instalacion, estado)
    `)
    .in("estado", ["borrador", "enviada", "aprobada"])
    .order("fecha", { ascending: false });

  if (search) {
    query = query.or(`numero.ilike.%${search}%,observaciones.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}
