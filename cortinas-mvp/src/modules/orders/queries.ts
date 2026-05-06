import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getOrders(search?: string) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("orders")
    .select("*, clients(nombre_completo, telefono)")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`numero.ilike.%${search}%,estado.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}
