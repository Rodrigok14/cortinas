"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const createBudgetSchema = z.object({
  section: z.enum(["genero", "roller", "bandas"]),
  cliente: z.string().trim().min(2, "Cliente es obligatorio"),
  telefono: z.string().trim().min(6, "Telefono es obligatorio"),
  direccion: z.string().trim().nullable().optional(),
  ambiente: z.string().trim().nullable().optional(),
  observaciones: z.string().trim().nullable().optional(),
  total: z.coerce.number().positive("Total invalido"),
  detalle: z.string().trim().min(4, "Detalle invalido"),
  items_json: z.string().trim().optional(),
});

const budgetItemSchema = z.object({
  section: z.enum(["genero", "roller", "bandas"]),
  detalle: z.string().trim().min(4, "Detalle invalido"),
  total: z.coerce.number().positive("Total invalido"),
});

function toText(value: FormDataEntryValue | null): string | null {
  const text = value?.toString().trim() ?? "";
  return text.length ? text : null;
}

function buildQuotationNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const random = Math.floor(Math.random() * 900 + 100);
  return `COT-${y}${m}${d}-${h}${min}-${random}`;
}

export async function createBudgetAction(formData: FormData): Promise<void> {
  try {
    const parsed = createBudgetSchema.parse({
      section: formData.get("section")?.toString(),
      cliente: formData.get("cliente")?.toString(),
      telefono: formData.get("telefono")?.toString(),
      direccion: toText(formData.get("direccion")),
      ambiente: toText(formData.get("ambiente")),
      observaciones: toText(formData.get("observaciones")),
      total: formData.get("total")?.toString(),
      detalle: formData.get("detalle")?.toString(),
      items_json: formData.get("items_json")?.toString(),
    });

    const supabase = getSupabaseServerClient();

    const { data: existingClient, error: clientSearchError } = await supabase
      .from("clients")
      .select("id")
      .eq("nombre_completo", parsed.cliente)
      .eq("telefono", parsed.telefono)
      .maybeSingle();

    if (clientSearchError) {
      throw new Error(clientSearchError.message);
    }

    let clientId = existingClient?.id;

    if (!clientId) {
      const { data: createdClient, error: createClientError } = await supabase
        .from("clients")
        .insert({
          nombre_completo: parsed.cliente,
          telefono: parsed.telefono,
          direccion: parsed.direccion,
          observaciones: parsed.ambiente
            ? `Ambiente principal: ${parsed.ambiente}${parsed.observaciones ? ` | ${parsed.observaciones}` : ""}`
            : parsed.observaciones,
        })
        .select("id")
        .single();

      if (createClientError || !createdClient) {
        throw new Error(createClientError?.message ?? "No se pudo crear cliente");
      }

      clientId = createdClient.id;
    }

    const numero = buildQuotationNumber();

    const { data: quotation, error: quotationError } = await supabase
      .from("quotations")
      .insert({
        client_id: clientId,
        numero,
        fecha: new Date().toISOString().slice(0, 10),
        estado: "borrador",
        descuento: 0,
        costo_instalacion: 0,
        anticipo_requerido: 0,
        observaciones: parsed.observaciones,
      })
      .select("id")
      .single();

    if (quotationError || !quotation) {
      throw new Error(quotationError?.message ?? "No se pudo crear cotizacion");
    }

    const parsedItems = parsed.items_json
      ? z.array(budgetItemSchema).min(1).parse(JSON.parse(parsed.items_json))
      : [{ section: parsed.section, detalle: parsed.detalle, total: parsed.total }];

    const itemsToInsert = parsedItems.map((item) => ({
      quotation_id: quotation.id,
      descripcion: `[${item.section.toUpperCase()}] ${item.detalle}`,
      cantidad: 1,
      precio_unitario: item.total,
    }));

    const { error: itemError } = await supabase.from("quotation_items").insert(itemsToInsert);

    if (itemError) {
      throw new Error(itemError.message);
    }

    redirect(`/cotizador?ok=1&numero=${encodeURIComponent(numero)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar el presupuesto";
    redirect(`/cotizador?error=${encodeURIComponent(message)}`);
  }
}
