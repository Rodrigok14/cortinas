"use server";

import { revalidate } from "@/lib/action-helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { projectSchema } from "@/lib/validations";

function toText(value: FormDataEntryValue | null): string | null {
  const text = value?.toString().trim() ?? "";
  return text ? text : null;
}

export async function createProjectAction(formData: FormData): Promise<void> {
  const parsed = projectSchema.parse({
    client_id: formData.get("client_id")?.toString(),
    nombre_obra: formData.get("nombre_obra")?.toString(),
    direccion_instalacion: toText(formData.get("direccion_instalacion")),
    estado: formData.get("estado")?.toString(),
    fecha_visita: toText(formData.get("fecha_visita")),
    fecha_entrega_estimada: toText(formData.get("fecha_entrega_estimada")),
    observaciones: toText(formData.get("observaciones")),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("projects").insert(parsed);
  if (error) throw new Error(error.message);

  revalidate(["/obras", "/dashboard", "/ambientes", "/instalaciones"]);
}

export async function updateProjectAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const parsed = projectSchema.parse({
    id,
    client_id: formData.get("client_id")?.toString(),
    nombre_obra: formData.get("nombre_obra")?.toString(),
    direccion_instalacion: toText(formData.get("direccion_instalacion")),
    estado: formData.get("estado")?.toString(),
    fecha_visita: toText(formData.get("fecha_visita")),
    fecha_entrega_estimada: toText(formData.get("fecha_entrega_estimada")),
    observaciones: toText(formData.get("observaciones")),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("projects").update(parsed).eq("id", id);
  if (error) throw new Error(error.message);
  revalidate(["/obras", "/dashboard", "/ambientes", "/instalaciones"]);
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidate(["/obras", "/dashboard", "/ambientes", "/instalaciones"]);
}
