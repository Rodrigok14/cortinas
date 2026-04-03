import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getClientOptions() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, nombre_completo")
    .order("nombre_completo");

  if (error) throw new Error(error.message);
  return data ?? [];
}
