import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getQuotations(search?: string) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("quotations")
    .select(`
      *,
      clients(nombre_completo),
      projects(nombre_obra),
      quotation_items(
        id,
        descripcion,
        cantidad,
        precio_unitario,
        total,
        measurements(
          tipo_producto,
          tipo_montaje,
          ancho,
          alto,
          cantidad,
          tela,
          color
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`numero.ilike.%${search}%,estado.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getQuotationOptions() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("quotations")
    .select("id, numero")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
