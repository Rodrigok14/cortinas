import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ModuleHeader } from "@/components/common/module-header";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table } from "@/components/ui/table";
import { requireModuleAccess } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { createLeadAction, updateLeadStatusAction } from "@/modules/leads/actions";
import { getLeads } from "@/modules/leads/queries";

type Props = { searchParams?: { q?: string } };

export default async function LeadsPage({ searchParams }: Props) {
  await requireModuleAccess("leads");
  const q = searchParams?.q ?? "";
  const leads = await getLeads(q);

  return (
    <section className="space-y-4">
      <ModuleHeader title="Leads" description="Pipeline comercial: captura, seguimiento y cierres." />

      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold">Nuevo lead</h2>
          <form action={createLeadAction} className="grid gap-2">
            <Input name="nombre" placeholder="Nombre" />
            <Input name="telefono" placeholder="Teléfono" />
            <Input name="email" placeholder="Email (opcional)" />
            <Input name="ciudad" placeholder="Ciudad (opcional)" />
            <Input name="fuente" placeholder="Fuente (web/whatsapp/referido)" />
            <Input name="observaciones" placeholder="Observaciones" />
            <SubmitButton>Crear lead</SubmitButton>
          </form>
        </Card>

        <Card className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Leads recientes</h2>
              <p className="text-sm text-slate-600">Buscá por nombre/teléfono/email.</p>
            </div>
            <form className="flex gap-2">
              <Input name="q" defaultValue={q} placeholder="Buscar..." />
              <button className="rounded-xl border bg-white/80 px-3 py-2 text-sm font-semibold">
                Buscar
              </button>
            </form>
          </div>

          <Table>
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-2 py-2">Nombre</th>
                <th className="px-2 py-2">Teléfono</th>
                <th className="px-2 py-2">Estado</th>
                <th className="px-2 py-2">Alta</th>
                <th className="px-2 py-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-100">
                  <td className="px-2 py-2">
                    <p className="font-semibold">{lead.nombre ?? "Sin nombre"}</p>
                    <p className="text-xs text-slate-500">{lead.fuente ?? "-"}</p>
                  </td>
                  <td className="px-2 py-2">{lead.telefono ?? "-"}</td>
                  <td className="px-2 py-2 capitalize">{lead.estado}</td>
                  <td className="px-2 py-2">{formatDate(lead.created_at)}</td>
                  <td className="px-2 py-2">
                    <form action={updateLeadStatusAction} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={lead.id} />
                      <Select name="estado" defaultValue={lead.estado ?? "nuevo"}>
                        <option value="nuevo">nuevo</option>
                        <option value="contactado">contactado</option>
                        <option value="visita_programada">visita_programada</option>
                        <option value="medicion_realizada">medicion_realizada</option>
                        <option value="cotizacion_enviada">cotizacion_enviada</option>
                        <option value="seguimiento">seguimiento</option>
                        <option value="cerrado_ganado">cerrado_ganado</option>
                        <option value="cerrado_perdido">cerrado_perdido</option>
                      </Select>
                      <button className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold">
                        Guardar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {!leads.length ? (
                <tr>
                  <td className="px-2 py-4 text-sm text-slate-500" colSpan={5}>
                    Sin leads aún.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </Card>
      </div>
    </section>
  );
}

