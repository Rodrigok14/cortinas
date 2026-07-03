"use server";

import { revalidate } from "@/lib/action-helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const allowedStatuses = new Set(["enviada", "aprobada", "rechazada", "vencida"]);

export async function updateBudgetStatusAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  const estado = formData.get("estado")?.toString();

  if (!id || !estado || !allowedStatuses.has(estado)) return;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("quotations").update({ estado }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidate(["/seguimiento", "/cotizaciones", "/dashboard"]);
}
