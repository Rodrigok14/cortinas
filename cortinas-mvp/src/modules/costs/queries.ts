import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getCosts(search?: string) {
  const supabase = getSupabaseServerClient();
  let query = supabase.from("product_costs").select("*").order("updated_at", { ascending: false });

  if (search) {
    query = query.or(`categoria.ilike.%${search}%,producto.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}
