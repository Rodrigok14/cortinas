"use server";

import { revalidate } from "@/lib/action-helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { installationSchema } from "@/lib/validations";

function toText(value: FormDataEntryValue | null): string | null {
  const text = value?.toString().trim() ?? "";
  return text ? text : null;
}

export async function createInstallationAction(formData: FormData): Promise<void> {
  const parsed = installationSchema.parse({
    project_id: formData.get("project_id")?.toString(),
    fecha_programada: formData.get("fecha_programada")?.toString(),
    tecnico: formData.get("tecnico")?.toString(),
    estado: formData.get("estado")?.toString(),
    observaciones: toText(formData.get("observaciones")),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("installations").insert(parsed);
  if (error) throw new Error(error.message);

  revalidate(["/instalaciones", "/dashboard", "/obras"]);
}

export async function updateInstallationAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const parsed = installationSchema.parse({
    id,
    project_id: formData.get("project_id")?.toString(),
    fecha_programada: formData.get("fecha_programada")?.toString(),
    tecnico: formData.get("tecnico")?.toString(),
    estado: formData.get("estado")?.toString(),
    observaciones: toText(formData.get("observaciones")),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("installations").update(parsed).eq("id", id);
  if (error) throw new Error(error.message);
  revalidate(["/instalaciones", "/dashboard", "/obras"]);
}

export async function deleteInstallationAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("installations").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidate(["/instalaciones", "/dashboard", "/obras"]);
}
