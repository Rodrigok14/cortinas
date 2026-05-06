"use server";

import { revalidate } from "@/lib/action-helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { roomSchema } from "@/lib/validations";

function toText(value: FormDataEntryValue | null): string | null {
  const text = value?.toString().trim() ?? "";
  return text ? text : null;
}

export async function createRoomAction(formData: FormData): Promise<void> {
  const parsed = roomSchema.parse({
    project_id: formData.get("project_id")?.toString(),
    nombre_ambiente: formData.get("nombre_ambiente")?.toString(),
    observaciones: toText(formData.get("observaciones")),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("rooms").insert(parsed);
  if (error) throw new Error(error.message);

  revalidate(["/ambientes", "/mediciones"]);
}

export async function updateRoomAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const parsed = roomSchema.parse({
    id,
    project_id: formData.get("project_id")?.toString(),
    nombre_ambiente: formData.get("nombre_ambiente")?.toString(),
    observaciones: toText(formData.get("observaciones")),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("rooms").update(parsed).eq("id", id);
  if (error) throw new Error(error.message);
  revalidate(["/ambientes", "/mediciones"]);
}

export async function deleteRoomAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("rooms").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidate(["/ambientes", "/mediciones"]);
}
