import { ModuleHeader } from "@/components/common/module-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { requireModuleAccess } from "@/lib/auth";
import { getClientOptions } from "@/lib/options";
import { money } from "@/lib/utils";
import { getProjectOptions } from "@/modules/projects/queries";
import {
  createQuotationAction,
  deleteQuotationAction,
  updateQuotationAction,
} from "@/modules/quotations/actions";
import { getQuotations } from "@/modules/quotations/queries";

const quotationStates = ["borrador", "enviada", "aprobada", "rechazada", "vencida"];

type Props = { searchParams?: { q?: string } };

export default async function QuotationsPage({ searchParams }: Props) {
  await requireModuleAccess("cotizaciones");
  const q = searchParams?.q?.trim();

  const [rows, clients, projects] = await Promise.all([
    getQuotations(q),
    getClientOptions(),
    getProjectOptions(),
  ]);
  const createAction = createQuotationAction;

  return (
    <section className="space-y-4">
      <ModuleHeader title="Cotizaciones" description="Control de cotizaciones y estado comercial" />

      <Card>
        <form action={createAction} className="grid gap-2 md:grid-cols-4">
          <Select name="client_id" required>
            <option value="">Cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.nombre_completo}
              </option>
            ))}
          </Select>
          <Select name="project_id">
            <option value="">Obra (opcional)</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.nombre_obra}
              </option>
            ))}
          </Select>
          <Input name="numero" placeholder="Numero" required />
          <Input name="fecha" type="date" required />
          <Select name="estado" defaultValue="borrador">
            {quotationStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </Select>
          <Input name="descuento" type="number" step="0.01" placeholder="Descuento" defaultValue={0} />
          <Input name="costo_instalacion" type="number" step="0.01" placeholder="Costo instalacion" defaultValue={0} />
          <Input name="anticipo_requerido" type="number" step="0.01" placeholder="Anticipo" defaultValue={0} />
          <Textarea className="md:col-span-4" name="observaciones" placeholder="Observaciones" rows={2} />
          <div className="md:col-span-4">
            <SubmitButton>Crear cotizacion</SubmitButton>
          </div>
        </form>
      </Card>

      <Card>
        <form className="mb-3 flex gap-2" method="get">
          <Input name="q" defaultValue={q} placeholder="Buscar por numero o estado" />
          <SubmitButton pendingText="Buscando...">Buscar</SubmitButton>
        </form>
        <Table>
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2">Numero</th>
              <th className="px-2 py-2">Cliente</th>
              <th className="px-2 py-2">Estado</th>
              <th className="px-2 py-2">Subtotal</th>
              <th className="px-2 py-2">Total</th>
              <th className="px-2 py-2">Saldo</th>
              <th className="px-2 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 align-top">
                <td className="px-2 py-2">{row.numero}</td>
                <td className="px-2 py-2">{Array.isArray(row.clients) ? row.clients[0]?.nombre_completo : row.clients?.nombre_completo}</td>
                <td className="px-2 py-2">{row.estado}</td>
                <td className="px-2 py-2">{money(row.subtotal)}</td>
                <td className="px-2 py-2">{money(row.total)}</td>
                <td className="px-2 py-2">{money(row.saldo)}</td>
                <td className="px-2 py-2">
                  <form action={deleteQuotationAction}>
                    <input type="hidden" name="id" value={row.id} />
                    <button className="rounded-lg border border-rose-200 px-2 py-1 text-xs text-rose-700">Eliminar</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold">Edicion rapida</h2>
        <div className="space-y-3">
          {rows.slice(0, 8).map((row) => (
            <form key={row.id} action={updateQuotationAction} className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-4">
              <input type="hidden" name="id" value={row.id} />
              <Select name="client_id" defaultValue={row.client_id}>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nombre_completo}
                  </option>
                ))}
              </Select>
              <Select name="project_id" defaultValue={row.project_id ?? ""}>
                <option value="">Sin obra</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.nombre_obra}
                  </option>
                ))}
              </Select>
              <Input name="numero" defaultValue={row.numero} />
              <Input name="fecha" type="date" defaultValue={row.fecha} />
              <Select name="estado" defaultValue={row.estado}>
                {quotationStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </Select>
              <Input name="descuento" type="number" step="0.01" defaultValue={row.descuento} />
              <Input name="costo_instalacion" type="number" step="0.01" defaultValue={row.costo_instalacion} />
              <Input name="anticipo_requerido" type="number" step="0.01" defaultValue={row.anticipo_requerido} />
              <Textarea className="md:col-span-3" name="observaciones" defaultValue={row.observaciones ?? ""} rows={2} />
              <SubmitButton className="h-fit">Guardar</SubmitButton>
            </form>
          ))}
        </div>
      </Card>
    </section>
  );
}
