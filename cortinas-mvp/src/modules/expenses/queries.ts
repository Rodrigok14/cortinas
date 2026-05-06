import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getExpenses(search?: string) {
  const supabase = getSupabaseServerClient();
  let query = supabase.from("expenses").select("*").order("fecha", { ascending: false });

  if (search) {
    query = query.or(`categoria.ilike.%${search}%,descripcion.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}
