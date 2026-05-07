"use server";

import { revalidate } from "@/lib/action-helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { toNullableString } from "@/lib/utils";

export async function createLeadAction(formData: FormData): Promise<void> {
  const payload = {
    nombre: toNullableString(formData.get("nombre")),
    telefono: toNullableString(formData.get("telefono")),
    email: toNullableString(formData.get("email")),
    ciudad: toNullableString(formData.get("ciudad")),
    fuente: toNullableString(formData.get("fuente")),
    observaciones: toNullableString(formData.get("observaciones")),
  };

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("leads").insert(payload);
  if (error) throw new Error(error.message);

  revalidate(["/leads", "/tareas", "/dashboard"]);
}

export async function updateLeadStatusAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  const estado = formData.get("estado")?.toString();
  if (!id || !estado) return;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("leads").update({ estado }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidate(["/leads", "/tareas", "/dashboard"]);
}

