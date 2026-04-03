import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getPayments(search?: string) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("payments")
    .select("*, quotations(numero)")
    .order("fecha_pago", { ascending: false });

  if (search) {
    query = query.or(`medio_pago.ilike.%${search}%,estado.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}
