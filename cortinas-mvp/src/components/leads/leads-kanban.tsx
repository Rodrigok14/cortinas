"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLeadStatusAction } from "@/modules/leads/actions";
import {
  LEAD_COLUMN_LABELS,
  LEAD_PIPELINE_STATUSES,
  type LeadPipelineStatus,
} from "@/modules/leads/pipeline";
import type { LeadListItem } from "@/modules/leads/queries";
import { cn, formatDate } from "@/lib/utils";

type Props = { leads: LeadListItem[] };

export function LeadsKanban({ leads: initialLeads }: Props) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const grouped = useMemo(() => {
    const map = new Map<LeadPipelineStatus, LeadListItem[]>();
    for (const s of LEAD_PIPELINE_STATUSES) {
      map.set(s, []);
    }
    for (const lead of leads) {
      const estado = lead.estado as LeadPipelineStatus;
      const list = map.get(estado);
      if (list) list.push(lead);
    }
    return map;
  }, [leads]);

  function onDragStart(leadId: string) {
    setDraggingId(leadId);
    setError(null);
  }

  function onDragEnd() {
    setDraggingId(null);
  }

  function handleDrop(column: LeadPipelineStatus, e: React.DragEvent) {
    e.preventDefault();
    onDragEnd();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;

    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.estado === column) return;

    const snapshot = leads;
    setLeads(leads.map((l) => (l.id === id ? { ...l, estado: column } : l)));

    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("id", id);
        fd.set("estado", column);
        await updateLeadStatusAction(fd);
        router.refresh();
      } catch (err) {
        setLeads(snapshot);
        setError(err instanceof Error ? err.message : "No se pudo actualizar el estado");
      }
    });
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      ) : null}
      <div className={cn("flex gap-3 overflow-x-auto pb-2", pending && "opacity-90")}>
        {LEAD_PIPELINE_STATUSES.map((status) => {
          const columnLeads = grouped.get(status) ?? [];
          return (
            <div
              key={status}
              className="flex min-w-[min(100%,280px)] max-w-[min(100%,320px)] flex-1 flex-col rounded-2xl border border-slate-200/80 bg-slate-50/60"
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => handleDrop(status, e)}
            >
              <div className="border-b border-slate-200/80 px-3 py-2">
                <p className="text-sm font-semibold text-slate-800">{LEAD_COLUMN_LABELS[status]}</p>
                <p className="text-xs text-slate-500">{columnLeads.length}</p>
              </div>
              <div className="flex flex-col gap-2 p-2">
                {columnLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", lead.id);
                      e.dataTransfer.effectAllowed = "move";
                      onDragStart(lead.id);
                    }}
                    onDragEnd={onDragEnd}
                    className={cn(
                      "cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-shadow active:cursor-grabbing",
                      draggingId === lead.id && "ring-2 ring-slate-400 ring-offset-2",
                    )}
                  >
                    <p className="font-semibold text-slate-900">{lead.nombre ?? "Sin nombre"}</p>
                    <p className="text-xs text-slate-500">{lead.telefono ?? "—"}</p>
                    {lead.fuente ? (
                      <p className="mt-1 text-xs font-medium text-slate-600">{lead.fuente}</p>
                    ) : null}
                    <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-400">
                      {formatDate(lead.created_at)}
                    </p>
                  </div>
                ))}
                {!columnLeads.length ? (
                  <p className="px-1 py-6 text-center text-xs text-slate-400">Arrastrá leads aquí</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
