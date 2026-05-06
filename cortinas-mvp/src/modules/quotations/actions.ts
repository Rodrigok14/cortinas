"use server";

import { revalidate } from "@/lib/action-helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { quotationSchema } from "@/lib/validations";

function toText(value: FormDataEntryValue | null): string | null {
  const text = value?.toString().trim() ?? "";
  return text ? text : null;
}

export async function createQuotationAction(formData: FormData): Promise<void> {
  const parsed = quotationSchema.parse({
    client_id: formData.get("client_id")?.toString(),
    project_id: toText(formData.get("project_id")),
    numero: formData.get("numero")?.toString(),
    fecha: formData.get("fecha")?.toString(),
    estado: formData.get("estado")?.toString(),
    descuento: formData.get("descuento")?.toString(),
    costo_instalacion: formData.get("costo_instalacion")?.toString(),
    anticipo_requerido: formData.get("anticipo_requerido")?.toString(),
    observaciones: toText(formData.get("observaciones")),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("quotations").insert(parsed);
  if (error) throw new Error(error.message);

  revalidate(["/cotizaciones", "/dashboard", "/pagos", "/items-cotizacion"]);
}

export async function updateQuotationAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const parsed = quotationSchema.parse({
    id,
    client_id: formData.get("client_id")?.toString(),
    project_id: toText(formData.get("project_id")),
    numero: formData.get("numero")?.toString(),
    fecha: formData.get("fecha")?.toString(),
    estado: formData.get("estado")?.toString(),
    descuento: formData.get("descuento")?.toString(),
    costo_instalacion: formData.get("costo_instalacion")?.toString(),
    anticipo_requerido: formData.get("anticipo_requerido")?.toString(),
    observaciones: toText(formData.get("observaciones")),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("quotations").update(parsed).eq("id", id);
  if (error) throw new Error(error.message);
  revalidate(["/cotizaciones", "/dashboard", "/pagos", "/items-cotizacion"]);
}

export async function deleteQuotationAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("quotations").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidate(["/cotizaciones", "/dashboard", "/pagos", "/items-cotizacion"]);
}
