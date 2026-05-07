"use server";

import { revalidate } from "@/lib/action-helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { toNullableString } from "@/lib/utils";

export async function createTaskAction(formData: FormData): Promise<void> {
  const payload = {
    titulo: (formData.get("titulo")?.toString() ?? "").trim(),
    descripcion: toNullableString(formData.get("descripcion")),
    tipo: toNullableString(formData.get("tipo")),
    prioridad: formData.get("prioridad")?.toString() ?? "media",
    fecha_vencimiento: toNullableString(formData.get("fecha_vencimiento")),
    lead_id: toNullableString(formData.get("lead_id")),
    client_id: toNullableString(formData.get("client_id")),
  };

  if (!payload.titulo) return;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("sales_tasks").insert(payload);
  if (error) throw new Error(error.message);

  revalidate(["/tareas", "/leads", "/dashboard"]);
}

export async function updateTaskStatusAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  const estado = formData.get("estado")?.toString();
  if (!id || !estado) return;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("sales_tasks").update({ estado }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidate(["/tareas", "/dashboard"]);
}

