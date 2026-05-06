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

type MeasurementData = {
  tipo_producto?: string;
  tipo_montaje?: string;
  ancho?: number;
  alto?: number;
  cantidad?: number;
  tela?: string;
  color?: string;
};

type QuotationItemData = {
  descripcion?: string;
  measurements?: MeasurementData | MeasurementData[] | null;
};

function getStateClasses(state: string) {
  if (state === "aprobada") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (state === "rechazada" || state === "vencida") return "border-rose-200 bg-rose-50 text-rose-700";
  if (state === "enviada") return "border-sky-200 bg-sky-50 text-sky-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

function formatSpecs(item: QuotationItemData) {
  const ms = Array.isArray(item.measurements) ? item.measurements[0] : item.measurements;
  if (!ms) return "Sin medicion vinculada";

  const tipo = ms.tipo_producto ?? "-";
  const montaje = ms.tipo_montaje ?? "-";
  const medidas = `${ms.ancho ?? "?"} x ${ms.alto ?? "?"}`;
  const detalleTela = [ms.tela, ms.color].filter(Boolean).join(" / ") || "Tela sin especificar";

  return `${tipo} | montaje ${montaje} | ${medidas} m | ${detalleTela}`;
}

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
      <ModuleHeader
        title="Cotizaciones"
        description="Control comercial con especificaciones tecnicas: tipo de cortina, montaje y medidas"
      />

      <Card>
        <div className="mb-3 grid gap-2 rounded-xl border border-sky-100 bg-sky-50 p-3 text-xs text-sky-800 md:grid-cols-3">
          <p><strong>Tip:</strong> crea la cotizacion aqui.</p>
          <p><strong>Medidas:</strong> detalle tecnico se toma desde items + mediciones.</p>
          <p><strong>Flujo:</strong> cotizacion -&gt; items -&gt; especificaciones completas.</p>
        </div>
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
              <th className="px-3 py-3">Numero</th>
              <th className="px-3 py-3">Cliente</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3">Especificaciones tecnicas</th>
              <th className="px-3 py-3">Totales</th>
              <th className="px-3 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any) => {
              const items = (row.quotation_items ?? []) as QuotationItemData[];
              return (
                <tr key={row.id} className="border-b border-slate-100 align-top">
                  <td className="px-3 py-3 font-semibold text-slate-800">{row.numero}</td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-700">{Array.isArray(row.clients) ? row.clients[0]?.nombre_completo : row.clients?.nombre_completo}</p>
                    <p className="text-xs text-slate-500">{Array.isArray(row.projects) ? row.projects[0]?.nombre_obra : row.projects?.nombre_obra}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`status-pill ${getStateClasses(row.estado)}`}>{row.estado}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="space-y-1.5 text-xs text-slate-600">
                      {items.length === 0 ? (
                        <p className="italic text-slate-400">Agrega items para ver alto, ancho y tipo de cortina.</p>
                      ) : (
                        items.slice(0, 3).map((item, index) => (
                          <p key={index}>
                            <strong>{item.descripcion ?? "Item"}:</strong> {formatSpecs(item)}
                          </p>
                        ))
                      )}
                      {items.length > 3 && <p className="text-slate-400">+ {items.length - 3} item(s) adicional(es)</p>}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-700">
                    <p>Subtotal: {money(row.subtotal)}</p>
                    <p>Total: {money(row.total)}</p>
                    <p className="font-semibold text-slate-900">Saldo: {money(row.saldo)}</p>
                  </td>
                  <td className="px-3 py-3">
                    <form action={deleteQuotationAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <button className="rounded-lg border border-rose-200 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50">Eliminar</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Edicion rapida</h2>
        <div className="space-y-3">
          {rows.slice(0, 8).map((row: any) => (
            <form key={row.id} action={updateQuotationAction} className="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-4">
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
