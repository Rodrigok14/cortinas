import { z } from "zod";

/** Orden del embudo en el tablero (izquierda → derecha). */
export const LEAD_PIPELINE_STATUSES = [
  "nuevo",
  "contactado",
  "visita_programada",
  "medicion_realizada",
  "cotizacion_enviada",
  "seguimiento",
  "cerrado_ganado",
  "cerrado_perdido",
] as const;

export type LeadPipelineStatus = (typeof LEAD_PIPELINE_STATUSES)[number];

export const LEAD_COLUMN_LABELS: Record<LeadPipelineStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  visita_programada: "Visita programada",
  medicion_realizada: "Medición",
  cotizacion_enviada: "Cotización enviada",
  seguimiento: "Seguimiento",
  cerrado_ganado: "Cerrado — ganado",
  cerrado_perdido: "Cerrado — perdido",
};

export const leadPipelineStatusSchema = z.enum(LEAD_PIPELINE_STATUSES);

export const setLeadStatusSchema = z.object({
  id: z.string().uuid("ID inválido"),
  estado: leadPipelineStatusSchema,
});
