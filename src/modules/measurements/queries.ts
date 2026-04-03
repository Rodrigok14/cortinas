import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getMeasurements(search?: string) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("measurements")
    .select("*, rooms(nombre_ambiente)")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`tela.ilike.%${search}%,color.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getMeasurementOptions() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("measurements")
    .select("id, tipo_producto, rooms(nombre_ambiente)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return data ?? [];
}
