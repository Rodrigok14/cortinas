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
import { getClosedBudgets } from "@/modules/follow-up/queries";

type Props = { searchParams?: { q?: string } };

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function FollowUpPage({ searchParams }: Props) {
  await requireModuleAccess("seguimiento");
  const q = searchParams?.q?.trim();
  const rows = await getClosedBudgets(q);

  const totalCerrado = rows.reduce((sum, row) => sum + Number(row.total ?? 0), 0);
  const saldoPendiente = rows.reduce((sum, row) => sum + Number(row.saldo ?? 0), 0);
  const clientesUnicos = new Set(rows.map((row) => row.client_id).filter(Boolean)).size;

  return (
    <section className="space-y-4">
      <ModuleHeader
        title="Seguimiento"
        description="Carpeta de clientes con presupuesto cerrado para controlar contacto, saldo y avance."
      />

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-emerald-200 bg-emerald-50">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Presupuestos cerrados</p>
          <p className="mt-2 text-3xl font-bold text-emerald-950">{rows.length}</p>
        </Card>
        <Card className="border-sky-200 bg-sky-50">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Clientes en seguimiento</p>
          <p className="mt-2 text-3xl font-bold text-sky-950">{clientesUnicos}</p>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Saldo pendiente</p>
          <p className="mt-2 text-3xl font-bold text-amber-950">{money(saldoPendiente)}</p>
          <p className="mt-1 text-xs text-amber-800">Total cerrado: {money(totalCerrado)}</p>
        </Card>
      </div>

      <Card>
        <form className="mb-4 grid gap-2 md:grid-cols-[1fr_auto]" method="get">
          <Input name="q" defaultValue={q} placeholder="Buscar por numero de presupuesto u observaciones" />
          <SubmitButton pendingText="Buscando...">Buscar</SubmitButton>
        </form>

        {rows.length === 0 ? (
          <EmptyState message="Todavia no hay presupuestos aprobados para seguimiento." />
        ) : (
          <Table>
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-3">Cliente</th>
                <th className="px-3 py-3">Presupuesto</th>
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
                      <p className="text-xs text-slate-500">Aprobado el {formatDate(row.fecha)}</p>
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
                        message={`Hola ${client?.nombre_completo ?? ""}, te escribimos de CortinasHome por el seguimiento de tu presupuesto ${row.numero}.`}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/clientes?q=${encodeURIComponent(client?.nombre_completo ?? "")}`}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Ver cliente
                      </Link>
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
