import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getTasks(includeDone = false) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("sales_tasks")
    .select("id, titulo, tipo, estado, prioridad, fecha_vencimiento, created_at, lead_id, client_id")
    .order("fecha_vencimiento", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (!includeDone) {
    query = query.not("estado", "in", "(completada,cancelada)");
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

