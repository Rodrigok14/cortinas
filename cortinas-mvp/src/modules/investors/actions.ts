"use server";

import { revalidate } from "@/lib/action-helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { investorSchema } from "@/lib/validations";

function toText(value: FormDataEntryValue | null): string | null {
  const text = value?.toString().trim() ?? "";
  return text ? text : null;
}

export async function createInvestorAction(formData: FormData): Promise<void> {
  const parsed = investorSchema.parse({
    nombre: formData.get("nombre")?.toString(),
    dia_pago: formData.get("dia_pago")?.toString(),
    monto_invertido: formData.get("monto_invertido")?.toString(),
    porcentaje_inversion: formData.get("porcentaje_inversion")?.toString(),
    monto_neto: formData.get("monto_neto")?.toString(),
    fecha_a_pagar: formData.get("fecha_a_pagar")?.toString(),
    estado: formData.get("estado")?.toString(),
    observaciones: toText(formData.get("observaciones")),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("investors").insert(parsed);
  if (error) throw new Error(error.message);

  revalidate(["/inversores", "/dashboard"]);
}

export async function updateInvestorAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const parsed = investorSchema.parse({
    id,
    nombre: formData.get("nombre")?.toString(),
    dia_pago: formData.get("dia_pago")?.toString(),
    monto_invertido: formData.get("monto_invertido")?.toString(),
    porcentaje_inversion: formData.get("porcentaje_inversion")?.toString(),
    monto_neto: formData.get("monto_neto")?.toString(),
    fecha_a_pagar: formData.get("fecha_a_pagar")?.toString(),
    estado: formData.get("estado")?.toString(),
    observaciones: toText(formData.get("observaciones")),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("investors").update(parsed).eq("id", id);
  if (error) throw new Error(error.message);

  revalidate(["/inversores", "/dashboard"]);
}

export async function deleteInvestorAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("investors").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidate(["/inversores", "/dashboard"]);
}
