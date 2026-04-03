import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getRooms(search?: string) {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("rooms")
    .select("*, projects(nombre_obra)")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("nombre_ambiente", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getRoomOptions() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id, nombre_ambiente")
    .order("nombre_ambiente");

  if (error) throw new Error(error.message);
  return data ?? [];
}
