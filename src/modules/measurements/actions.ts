"use server";

import { revalidate } from "@/lib/action-helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { measurementSchema } from "@/lib/validations";

function toText(value: FormDataEntryValue | null): string | null {
  const text = value?.toString().trim() ?? "";
  return text ? text : null;
}

async function uploadMeasurementPhoto(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Sesion invalida para subir foto");

  const extension = file.name.split(".").pop() ?? "jpg";
  const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("measurement-photos").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw new Error(error.message);
  return filePath;
}

export async function createMeasurementAction(formData: FormData): Promise<void> {
  const photo = formData.get("foto") as File | null;
  const photoPath = await uploadMeasurementPhoto(photo);

  const parsed = measurementSchema.parse({
    room_id: formData.get("room_id")?.toString(),
    tipo_producto: formData.get("tipo_producto")?.toString(),
    tipo_montaje: formData.get("tipo_montaje")?.toString(),
    ancho: formData.get("ancho")?.toString(),
    alto: formData.get("alto")?.toString(),
    cantidad: formData.get("cantidad")?.toString(),
    lado_mando: formData.get("lado_mando")?.toString(),
    tela: toText(formData.get("tela")),
    color: toText(formData.get("color")),
    observaciones: toText(formData.get("observaciones")),
  });

  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("measurements").insert({
    ...parsed,
    foto_url: photoPath,
    measured_by: user?.id ?? null,
  });

  if (error) throw new Error(error.message);
  revalidate(["/mediciones", "/items-cotizacion"]);
}

export async function updateMeasurementAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const parsed = measurementSchema.parse({
    id,
    room_id: formData.get("room_id")?.toString(),
    tipo_producto: formData.get("tipo_producto")?.toString(),
    tipo_montaje: formData.get("tipo_montaje")?.toString(),
    ancho: formData.get("ancho")?.toString(),
    alto: formData.get("alto")?.toString(),
    cantidad: formData.get("cantidad")?.toString(),
    lado_mando: formData.get("lado_mando")?.toString(),
    tela: toText(formData.get("tela")),
    color: toText(formData.get("color")),
    observaciones: toText(formData.get("observaciones")),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("measurements").update(parsed).eq("id", id);
  if (error) throw new Error(error.message);
  revalidate(["/mediciones", "/items-cotizacion"]);
}

export async function deleteMeasurementAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("measurements").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidate(["/mediciones", "/items-cotizacion"]);
}
