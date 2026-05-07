import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getInvestors(search?: string) {
  const supabase = getSupabaseServerClient();
  let query = supabase.from("investors").select("*").order("fecha_a_pagar", { ascending: true });

  if (search) {
    query = query.or(`nombre.ilike.%${search}%,estado.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}
