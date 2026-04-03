import { ModuleHeader } from "@/components/common/module-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table } from "@/components/ui/table";
import { requireModuleAccess } from "@/lib/auth";
import { money } from "@/lib/utils";
import {
  createQuotationItemAction,
  deleteQuotationItemAction,
  updateQuotationItemAction,
} from "@/modules/quotation-items/actions";
import { getQuotationItems } from "@/modules/quotation-items/queries";
import { getMeasurementOptions } from "@/modules/measurements/queries";
import { getQuotationOptions } from "@/modules/quotations/queries";

type Props = { searchParams?: { q?: string } };

export default async function QuotationItemsPage({ searchParams }: Props) {
  await requireModuleAccess("items-cotizacion");
  const q = searchParams?.q?.trim();

  const [rows, quotations, measurements] = await Promise.all([
    getQuotationItems(q),
    getQuotationOptions(),
    getMeasurementOptions(),
  ]);
  const createAction = createQuotationItemAction;
  const roomLabel = (measurement: any) =>
    Array.isArray(measurement.rooms)
      ? measurement.rooms[0]?.nombre_ambiente
      : measurement.rooms?.nombre_ambiente;

  return (
    <section className="space-y-4">
      <ModuleHeader title="Items de cotizacion" description="Cada item recalcula subtotal y total automaticamente" />

      <Card>
        <form action={createAction} className="grid gap-2 md:grid-cols-4">
          <Select name="quotation_id" required>
            <option value="">Cotizacion</option>
            {quotations.map((quotation) => (
              <option key={quotation.id} value={quotation.id}>
                {quotation.numero}
              </option>
            ))}
          </Select>
          <Select name="measurement_id">
            <option value="">Medicion (opcional)</option>
            {measurements.map((measurement) => (
              <option key={measurement.id} value={measurement.id}>
                {roomLabel(measurement)} - {measurement.tipo_producto}
              </option>
            ))}
          </Select>
          <Input name="descripcion" placeholder="Descripcion" required />
          <Input name="cantidad" type="number" step="0.01" defaultValue={1} required />
          <Input name="precio_unitario" type="number" step="0.01" defaultValue={0} required />
          <div className="md:col-span-4">
            <SubmitButton>Agregar item</SubmitButton>
          </div>
        </form>
      </Card>

      <Card>
        <form className="mb-3 flex gap-2" method="get">
          <Input name="q" defaultValue={q} placeholder="Buscar por descripcion" />
          <SubmitButton pendingText="Buscando...">Buscar</SubmitButton>
        </form>
        <Table>
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2">Cotizacion</th>
              <th className="px-2 py-2">Descripcion</th>
              <th className="px-2 py-2">Cantidad</th>
              <th className="px-2 py-2">Unitario</th>
              <th className="px-2 py-2">Total</th>
              <th className="px-2 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 align-top">
                <td className="px-2 py-2">{Array.isArray(row.quotations) ? row.quotations[0]?.numero : row.quotations?.numero}</td>
                <td className="px-2 py-2">{row.descripcion}</td>
                <td className="px-2 py-2">{row.cantidad}</td>
                <td className="px-2 py-2">{money(row.precio_unitario)}</td>
                <td className="px-2 py-2">{money(row.total)}</td>
                <td className="px-2 py-2">
                  <form action={deleteQuotationItemAction}>
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
            <form key={row.id} action={updateQuotationItemAction} className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-4">
              <input type="hidden" name="id" value={row.id} />
              <Select name="quotation_id" defaultValue={row.quotation_id}>
                {quotations.map((quotation) => (
                  <option key={quotation.id} value={quotation.id}>
                    {quotation.numero}
                  </option>
                ))}
              </Select>
              <Select name="measurement_id" defaultValue={row.measurement_id ?? ""}>
                <option value="">Sin medicion</option>
                {measurements.map((measurement) => (
                  <option key={measurement.id} value={measurement.id}>
                    {roomLabel(measurement)} - {measurement.tipo_producto}
                  </option>
                ))}
              </Select>
              <Input name="descripcion" defaultValue={row.descripcion} />
              <Input name="cantidad" type="number" step="0.01" defaultValue={row.cantidad} />
              <Input name="precio_unitario" type="number" step="0.01" defaultValue={row.precio_unitario} />
              <SubmitButton className="h-fit">Guardar</SubmitButton>
            </form>
          ))}
        </div>
      </Card>
    </section>
  );
}
