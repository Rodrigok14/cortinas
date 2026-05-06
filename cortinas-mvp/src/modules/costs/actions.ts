"use server";

import { revalidate } from "@/lib/action-helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { costSchema } from "@/lib/validations";

function toText(value: FormDataEntryValue | null): string | null {
  const text = value?.toString().trim() ?? "";
  return text ? text : null;
}

export async function createCostAction(formData: FormData): Promise<void> {
  const parsed = costSchema.parse({
    categoria: formData.get("categoria")?.toString(),
    producto: formData.get("producto")?.toString(),
    costo_unitario: formData.get("costo_unitario")?.toString(),
    unidad: formData.get("unidad")?.toString(),
    observaciones: toText(formData.get("observaciones")),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("product_costs").insert(parsed);
  if (error) throw new Error(error.message);

  revalidate(["/costos", "/control", "/cotizador"]);
}

export async function updateCostAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const parsed = costSchema.parse({
    id,
    categoria: formData.get("categoria")?.toString(),
    producto: formData.get("producto")?.toString(),
    costo_unitario: formData.get("costo_unitario")?.toString(),
    unidad: formData.get("unidad")?.toString(),
    observaciones: toText(formData.get("observaciones")),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("product_costs").update(parsed).eq("id", id);
  if (error) throw new Error(error.message);

  revalidate(["/costos", "/control", "/cotizador"]);
}

export async function deleteCostAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("product_costs").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidate(["/costos", "/control", "/cotizador"]);
}
