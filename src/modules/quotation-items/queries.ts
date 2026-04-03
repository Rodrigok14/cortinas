import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getQuotationItems(search?: string) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("quotation_items")
    .select("*, quotations(numero), measurements(tipo_producto)")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("descripcion", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}
