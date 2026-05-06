"use server";

import { revalidate } from "@/lib/action-helpers";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { expenseSchema } from "@/lib/validations";

export async function createExpenseAction(formData: FormData): Promise<void> {
  const parsed = expenseSchema.parse({
    fecha: formData.get("fecha")?.toString(),
    categoria: formData.get("categoria")?.toString(),
    descripcion: formData.get("descripcion")?.toString(),
    monto: formData.get("monto")?.toString(),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("expenses").insert(parsed);
  if (error) throw new Error(error.message);

  revalidate(["/gastos", "/control", "/dashboard"]);
}

export async function updateExpenseAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const parsed = expenseSchema.parse({
    id,
    fecha: formData.get("fecha")?.toString(),
    categoria: formData.get("categoria")?.toString(),
    descripcion: formData.get("descripcion")?.toString(),
    monto: formData.get("monto")?.toString(),
  });

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("expenses").update(parsed).eq("id", id);
  if (error) throw new Error(error.message);

  revalidate(["/gastos", "/control", "/dashboard"]);
}

export async function deleteExpenseAction(formData: FormData): Promise<void> {
  const id = formData.get("id")?.toString();
  if (!id) return;

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidate(["/gastos", "/control", "/dashboard"]);
}
