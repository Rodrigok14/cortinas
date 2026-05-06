"use server";

import { revalidate } from "@/lib/action-helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { orderSchema } from "@/lib/validations";

function toText(value: FormDataEntryValue | null): string | null {
  const text = value?.toString().trim() ?? "";
  return text ? text : null;
}

export async function createOrderAction(formData: FormData): Promise<void> {
  const parsed = orderSchema.parse({
    client_id: formData.get("client_id")?.toString(),
    numero: formData.get("numero")?.toString(),
    fecha_pedido: formData.get("fecha_pedido")?.toString(),
    estado: formData.get("estado")?.toString(),
    fecha_entrega_estimada: toText(formData.get("fecha_entrega_estimada")),
    total_venta: formData.get("total_venta")?.toString(),
    costo_total: formData.get("costo_total")?.toString(),
    observaciones: toText(formData.get("observaciones")),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("orders").insert(parsed);
  if (error) throw new Error(error.message);

  revalidate(["/pedidos", "/control", "/dashboard"]);
}

export async function updateOrderAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const parsed = orderSchema.parse({
    id,
    client_id: formData.get("client_id")?.toString(),
    numero: formData.get("numero")?.toString(),
    fecha_pedido: formData.get("fecha_pedido")?.toString(),
    estado: formData.get("estado")?.toString(),
    fecha_entrega_estimada: toText(formData.get("fecha_entrega_estimada")),
    total_venta: formData.get("total_venta")?.toString(),
    costo_total: formData.get("costo_total")?.toString(),
    observaciones: toText(formData.get("observaciones")),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("orders").update(parsed).eq("id", id);
  if (error) throw new Error(error.message);

  revalidate(["/pedidos", "/control", "/dashboard"]);
}

export async function deleteOrderAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidate(["/pedidos", "/control", "/dashboard"]);
}
