import { tool as baseTool } from "ai";
import { z } from "zod";
import { monthYearSchema, getProjectProfitabilitySchema, createTaskSchema } from "@/modules/ai/schemas/tools";
import { getMonthlyRevenue, getCashflow, getPendingReceivables, generateFinancialSummary } from "@/modules/ai/services/finance";
import { getUpcomingInstallments, getExpiringQuotations, getOperationalAlerts, getProjectProfitability } from "@/modules/ai/services/operations";
import { createTaskAction } from "@/modules/ai/actions/create-task";

// NOTE: The `ai` package tool() type surface has changed across versions.
// We keep runtime behavior but relax TS here to avoid blocking app builds.
const tool = baseTool as unknown as any;

export function buildAiTools(args: { organizationId: string; userId: string }) {
  return {
    getMonthlyRevenue: tool({
      description: "Obtener ingresos del mes (cobrado + pendiente) en forma agregada.",
      parameters: monthYearSchema,
      execute: async ({ month, year }: any) => getMonthlyRevenue({ month, year }),
    }),

    getCashflow: tool({
      description: "Calcular flujo de caja del mes (ingresos, egresos, balance).",
      parameters: monthYearSchema,
      execute: async ({ month, year }: any) => getCashflow({ month, year }),
    }),

    getPendingReceivables: tool({
      description: "Clientes con deuda pendiente (top 10 por saldo).",
      parameters: z.object({ limit: z.number().int().min(1).max(25).optional() }),
      execute: async ({ limit }: any) => getPendingReceivables(limit ?? 10),
    }),

    getUpcomingInstallments: tool({
      description: "Cuotas proveedor próximas a vencer (por defecto próximos 7 días).",
      parameters: z.object({
        daysAhead: z.number().int().min(1).max(60).optional(),
        limit: z.number().int().min(1).max(25).optional(),
      }),
      execute: async ({ daysAhead, limit }: any) => getUpcomingInstallments(daysAhead ?? 7, limit ?? 10),
    }),

    getProjectProfitability: tool({
      description: "Rentabilidad por proyecto (agregados).",
      parameters: getProjectProfitabilitySchema,
      execute: async ({ projectId }: any) => getProjectProfitability(projectId),
    }),

    getExpiringQuotations: tool({
      description: "Cotizaciones próximas a vencer (por defecto próximos 7 días).",
      parameters: z.object({
        daysAhead: z.number().int().min(1).max(60).optional(),
        limit: z.number().int().min(1).max(25).optional(),
      }),
      execute: async ({ daysAhead, limit }: any) => getExpiringQuotations(daysAhead ?? 7, limit ?? 10),
    }),

    getOperationalAlerts: tool({
      description: "Alertas operativas agregadas (tareas abiertas, instalaciones atrasadas).",
      parameters: z.object({}),
      execute: async (_args: any) => getOperationalAlerts(),
    }),

    createTask: tool({
      description: "Crear una tarea operativa dentro del sistema (validada y con permisos).",
      parameters: createTaskSchema,
      execute: async ({ title, description, dueDate, assignedTo }: any) =>
        createTaskAction({
          organizationId: args.organizationId,
          createdBy: args.userId,
          title,
          description,
          dueDate,
          assignedTo,
        }),
    }),

    generateFinancialSummary: tool({
      description: "Generar resumen financiero mensual (ingresos, egresos, margen, alertas, insights).",
      parameters: monthYearSchema,
      execute: async ({ month, year }: any) => generateFinancialSummary({ month, year }),
    }),
  };
}

