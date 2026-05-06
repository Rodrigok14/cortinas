"use server";

import { revalidate } from "@/lib/action-helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { paymentSchema } from "@/lib/validations";

function toText(value: FormDataEntryValue | null): string | null {
  const text = value?.toString().trim() ?? "";
  return text ? text : null;
}

async function uploadPaymentProof(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Sesion invalida para subir comprobante");

  const extension = file.name.split(".").pop() ?? "jpg";
  const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("payment-proofs").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw new Error(error.message);
  return filePath;
}

export async function createPaymentAction(formData: FormData): Promise<void> {
  const proof = formData.get("comprobante") as File | null;
  const proofPath = await uploadPaymentProof(proof);

  const parsed = paymentSchema.parse({
    quotation_id: formData.get("quotation_id")?.toString(),
    fecha_pago: formData.get("fecha_pago")?.toString(),
    monto: formData.get("monto")?.toString(),
    medio_pago: formData.get("medio_pago")?.toString(),
    estado: formData.get("estado")?.toString(),
    observaciones: toText(formData.get("observaciones")),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("payments").insert({
    ...parsed,
    comprobante_url: proofPath,
  });

  if (error) throw new Error(error.message);
  revalidate(["/pagos", "/cotizaciones", "/dashboard"]);
}

export async function updatePaymentAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const parsed = paymentSchema.parse({
    id,
    quotation_id: formData.get("quotation_id")?.toString(),
    fecha_pago: formData.get("fecha_pago")?.toString(),
    monto: formData.get("monto")?.toString(),
    medio_pago: formData.get("medio_pago")?.toString(),
    estado: formData.get("estado")?.toString(),
    observaciones: toText(formData.get("observaciones")),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("payments").update(parsed).eq("id", id);
  if (error) throw new Error(error.message);
  revalidate(["/pagos", "/cotizaciones", "/dashboard"]);
}

export async function deletePaymentAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidate(["/pagos", "/cotizaciones", "/dashboard"]);
}
