import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state";
import { ModuleHeader } from "@/components/common/module-header";
import { WhatsAppButton } from "@/components/common/whatsapp-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table } from "@/components/ui/table";
import { requireModuleAccess } from "@/lib/auth";
import { formatDate, money } from "@/lib/utils";
import { updateBudgetStatusAction } from "@/modules/follow-up/actions";
import { getFollowUpBudgets } from "@/modules/follow-up/queries";

type FollowUpFilter = "todos" | "pendientes" | "cerrados";
type Props = { searchParams?: { q?: string; estado?: string } };

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function getFilter(value: string | undefined): FollowUpFilter {
  if (value === "pendientes" || value === "cerrados") return value;
  return "todos";
}

function isPendingStatus(status: string | null | undefined) {
  return status === "borrador" || status === "enviada";
}

function getStatusLabel(status: string | null | undefined) {
  const labels: Record<string, string> = {
    borrador: "Pendiente",
    enviada: "Pendiente",
    aprobada: "Cerrado",
    rechazada: "Rechazado",
    vencida: "Vencido",
  };

  return labels[status ?? ""] ?? status ?? "-";
}

function getStatusClass(status: string | null | undefined) {
  if (status === "aprobada") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (isPendingStatus(status)) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function filterHref(filter: FollowUpFilter, q?: string) {
  const params = new URLSearchParams();
  params.set("estado", filter);
  if (q) params.set("q", q);
  return `/seguimiento?${params.toString()}`;
}

export default async function FollowUpPage({ searchParams }: Props) {
  await requireModuleAccess("seguimiento");
  const q = searchParams?.q?.trim();
  const activeFilter = getFilter(searchParams?.estado);
  const allRows = await getFollowUpBudgets(q);
  const pendingRows = allRows.filter((row) => isPendingStatus(row.estado));
  const closedRows = allRows.filter((row) => row.estado === "aprobada");
  const rows =
    activeFilter === "pendientes" ? pendingRows : activeFilter === "cerrados" ? closedRows : allRows;

  const totalCerrado = closedRows.reduce((sum, row) => sum + Number(row.total ?? 0), 0);
  const saldoPendiente = allRows.reduce((sum, row) => sum + Number(row.saldo ?? 0), 0);
  const clientesUnicos = new Set(allRows.map((row) => row.client_id).filter(Boolean)).size;

  return (
    <section className="space-y-4">
      <ModuleHeader
        title="Seguimiento"
        description="Carpeta comercial para presupuestos pendientes y cerrados, con contacto y cambio de estado."
      />

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Presupuestos pendientes</p>
          <p className="mt-2 text-3xl font-bold text-amber-950">{pendingRows.length}</p>
          <p className="mt-1 text-xs text-amber-800">Para llamar, escribir y cerrar venta</p>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Presupuestos cerrados</p>
          <p className="mt-2 text-3xl font-bold text-emerald-950">{closedRows.length}</p>
          <p className="mt-1 text-xs text-emerald-800">Total cerrado: {money(totalCerrado)}</p>
        </Card>
        <Card className="border-sky-200 bg-sky-50">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Clientes en seguimiento</p>
          <p className="mt-2 text-3xl font-bold text-sky-950">{clientesUnicos}</p>
        </Card>
      </div>

      <Card>
        <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-wrap gap-2">
            {[
              ["todos", `Todos (${allRows.length})`],
              ["pendientes", `Pendientes (${pendingRows.length})`],
              ["cerrados", `Cerrados (${closedRows.length})`],
            ].map(([value, label]) => (
              <Link
                key={value}
                href={filterHref(value as FollowUpFilter, q)}
                className={
                  activeFilter === value
                    ? "rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                }
              >
                {label}
              </Link>
            ))}
          </div>
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Saldo pendiente general: <strong>{money(saldoPendiente)}</strong>
          </p>
        </div>

        <form className="mb-4 grid gap-2 md:grid-cols-[1fr_auto]" method="get">
          <input type="hidden" name="estado" value={activeFilter} />
          <Input name="q" defaultValue={q} placeholder="Buscar por numero de presupuesto u observaciones" />
          <SubmitButton pendingText="Buscando...">Buscar</SubmitButton>
        </form>

        {rows.length === 0 ? (
          <EmptyState message="Todavia no hay presupuestos en esta carpeta de seguimiento." />
        ) : (
          <Table>
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-3">Cliente</th>
                <th className="px-3 py-3">Presupuesto</th>
                <th className="px-3 py-3">Estado</th>
                <th className="px-3 py-3">Domicilio / obra</th>
                <th className="px-3 py-3">Total</th>
                <th className="px-3 py-3">Saldo</th>
                <th className="px-3 py-3">Contacto</th>
                <th className="px-3 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const client = firstRelation(row.clients);
                const project = firstRelation(row.projects);

                return (
                  <tr key={row.id} className="border-b border-slate-100 align-top hover:bg-slate-50">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-900">{client?.nombre_completo ?? "Cliente sin nombre"}</p>
                      <p className="text-xs text-slate-500">{client?.email ?? "Sin email"}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-900">{row.numero}</p>
                      <p className="text-xs text-slate-500">Creado el {formatDate(row.fecha)}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(row.estado)}`}>
                        {getStatusLabel(row.estado)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-slate-800">{project?.nombre_obra ?? "Sin obra asociada"}</p>
                      <p className="text-xs text-slate-500">
                        {project?.direccion_instalacion ?? client?.direccion ?? "Sin domicilio cargado"}
                      </p>
                    </td>
                    <td className="px-3 py-3 font-semibold">{money(row.total)}</td>
                    <td className="px-3 py-3">
                      <span className={Number(row.saldo ?? 0) > 0 ? "font-semibold text-amber-700" : "font-semibold text-emerald-700"}>
                        {money(row.saldo)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <WhatsAppButton
                        phone={client?.telefono}
                        message={
                          isPendingStatus(row.estado)
                            ? `Hola ${client?.nombre_completo ?? ""}, te escribimos de CortinasHome para hacer seguimiento del presupuesto ${row.numero}.`
                            : `Hola ${client?.nombre_completo ?? ""}, te escribimos de CortinasHome por el avance de tu presupuesto ${row.numero}.`
                        }
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        {isPendingStatus(row.estado) && (
                          <form action={updateBudgetStatusAction}>
                            <input type="hidden" name="id" value={row.id} />
                            <input type="hidden" name="estado" value="aprobada" />
                            <button className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700">
                              Cerrar
                            </button>
                          </form>
                        )}
                        {row.estado === "aprobada" && (
                          <form action={updateBudgetStatusAction}>
                            <input type="hidden" name="id" value={row.id} />
                            <input type="hidden" name="estado" value="enviada" />
                            <button className="rounded-lg border border-amber-200 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50">
                              Volver pendiente
                            </button>
                          </form>
                        )}
                        <form action={updateBudgetStatusAction}>
                          <input type="hidden" name="id" value={row.id} />
                          <input type="hidden" name="estado" value="rechazada" />
                          <button className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                            Rechazar
                          </button>
                        </form>
                        <Link
                          href={`/clientes?q=${encodeURIComponent(client?.nombre_completo ?? "")}`}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Ver cliente
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </section>
  );
}
