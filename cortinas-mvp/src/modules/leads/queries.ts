import { getSupabaseServerClient } from "@/lib/supabase/server";

export type LeadListItem = {
  id: string;
  nombre: string | null;
  telefono: string | null;
  email: string | null;
  ciudad: string | null;
  fuente: string | null;
  estado: string | null;
  prioridad: string | null;
  created_at: string;
};

export async function getLeads(search?: string): Promise<LeadListItem[]> {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("leads")
    .select("id, nombre, telefono, email, ciudad, fuente, estado, prioridad, created_at")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`nombre.ilike.%${search}%,telefono.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

