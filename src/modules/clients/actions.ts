"use server";

import { revalidate } from "@/lib/action-helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { clientSchema } from "@/lib/validations";

function toText(value: FormDataEntryValue | null): string | null {
  const text = value?.toString().trim() ?? "";
  return text ? text : null;
}

export async function createClientAction(formData: FormData): Promise<void> {
  const parsed = clientSchema.parse({
    nombre_completo: formData.get("nombre_completo")?.toString(),
    telefono: formData.get("telefono")?.toString(),
    email: toText(formData.get("email")),
    direccion: toText(formData.get("direccion")),
    ciudad: toText(formData.get("ciudad")),
    observaciones: toText(formData.get("observaciones")),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("clients").insert(parsed);
  if (error) throw new Error(error.message);

  revalidate(["/clientes", "/dashboard"]);
}

export async function updateClientAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const parsed = clientSchema.parse({
    id,
    nombre_completo: formData.get("nombre_completo")?.toString(),
    telefono: formData.get("telefono")?.toString(),
    email: toText(formData.get("email")),
    direccion: toText(formData.get("direccion")),
    ciudad: toText(formData.get("ciudad")),
    observaciones: toText(formData.get("observaciones")),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("clients").update(parsed).eq("id", id);
  if (error) throw new Error(error.message);
  revalidate(["/clientes", "/dashboard"]);
}

export async function deleteClientAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidate(["/clientes", "/dashboard"]);
}
