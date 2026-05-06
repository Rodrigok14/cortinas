"use server";

import { revalidate } from "@/lib/action-helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { quotationItemSchema } from "@/lib/validations";

function toText(value: FormDataEntryValue | null): string | null {
  const text = value?.toString().trim() ?? "";
  return text ? text : null;
}

export async function createQuotationItemAction(formData: FormData): Promise<void> {
  const parsed = quotationItemSchema.parse({
    quotation_id: formData.get("quotation_id")?.toString(),
    measurement_id: toText(formData.get("measurement_id")),
    descripcion: formData.get("descripcion")?.toString(),
    cantidad: formData.get("cantidad")?.toString(),
    precio_unitario: formData.get("precio_unitario")?.toString(),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("quotation_items").insert(parsed);
  if (error) throw new Error(error.message);

  revalidate(["/items-cotizacion", "/cotizaciones", "/dashboard", "/pagos"]);
}

export async function updateQuotationItemAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const parsed = quotationItemSchema.parse({
    id,
    quotation_id: formData.get("quotation_id")?.toString(),
    measurement_id: toText(formData.get("measurement_id")),
    descripcion: formData.get("descripcion")?.toString(),
    cantidad: formData.get("cantidad")?.toString(),
    precio_unitario: formData.get("precio_unitario")?.toString(),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("quotation_items").update(parsed).eq("id", id);
  if (error) throw new Error(error.message);
  revalidate(["/items-cotizacion", "/cotizaciones", "/dashboard", "/pagos"]);
}

export async function deleteQuotationItemAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("quotation_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidate(["/items-cotizacion", "/cotizaciones", "/dashboard", "/pagos"]);
}
