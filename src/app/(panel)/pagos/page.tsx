import { ModuleHeader } from "@/components/common/module-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { requireModuleAccess } from "@/lib/auth";
import { money } from "@/lib/utils";
import { createPaymentAction, deletePaymentAction, updatePaymentAction } from "@/modules/payments/actions";
import { getPayments } from "@/modules/payments/queries";
import { getQuotationOptions } from "@/modules/quotations/queries";

type Props = { searchParams?: { q?: string } };

export default async function PaymentsPage({ searchParams }: Props) {
  await requireModuleAccess("pagos");
  const q = searchParams?.q?.trim();

  const [rows, quotations] = await Promise.all([getPayments(q), getQuotationOptions()]);
  const createAction = createPaymentAction;

  return (
    <section className="space-y-4">
      <ModuleHeader title="Pagos" description="Registro de pagos y saldo automatico" />

      <Card>
        <form action={createAction} className="grid gap-2 md:grid-cols-4" encType="multipart/form-data">
          <Select name="quotation_id" required>
            <option value="">Cotizacion</option>
            {quotations.map((quotation) => (
              <option key={quotation.id} value={quotation.id}>
                {quotation.numero}
              </option>
            ))}
          </Select>
          <Input name="fecha_pago" type="date" required />
          <Input name="monto" type="number" step="0.01" required />
          <Input name="medio_pago" placeholder="Medio de pago" required />
          <Input name="estado" placeholder="Estado" defaultValue="registrado" required />
          <Input name="comprobante" type="file" accept="image/*,.pdf" />
          <Textarea className="md:col-span-2" name="observaciones" rows={2} placeholder="Observaciones" />
          <div className="md:col-span-4">
            <SubmitButton>Registrar pago</SubmitButton>
          </div>
        </form>
      </Card>

      <Card>
        <form className="mb-3 flex gap-2" method="get">
          <Input name="q" defaultValue={q} placeholder="Buscar por medio o estado" />
          <SubmitButton pendingText="Buscando...">Buscar</SubmitButton>
        </form>
        <Table>
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2">Cotizacion</th>
              <th className="px-2 py-2">Fecha</th>
              <th className="px-2 py-2">Monto</th>
              <th className="px-2 py-2">Medio</th>
              <th className="px-2 py-2">Estado</th>
              <th className="px-2 py-2">Comprobante</th>
              <th className="px-2 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 align-top">
                <td className="px-2 py-2">{Array.isArray(row.quotations) ? row.quotations[0]?.numero : row.quotations?.numero}</td>
                <td className="px-2 py-2">{row.fecha_pago}</td>
                <td className="px-2 py-2">{money(row.monto)}</td>
                <td className="px-2 py-2">{row.medio_pago}</td>
                <td className="px-2 py-2">{row.estado}</td>
                <td className="px-2 py-2">{row.comprobante_url ? "Cargado" : "-"}</td>
                <td className="px-2 py-2">
                  <form action={deletePaymentAction}>
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
            <form key={row.id} action={updatePaymentAction} className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-4">
              <input type="hidden" name="id" value={row.id} />
              <Select name="quotation_id" defaultValue={row.quotation_id}>
                {quotations.map((quotation) => (
                  <option key={quotation.id} value={quotation.id}>
                    {quotation.numero}
                  </option>
                ))}
              </Select>
              <Input name="fecha_pago" type="date" defaultValue={row.fecha_pago} />
              <Input name="monto" type="number" step="0.01" defaultValue={row.monto} />
              <Input name="medio_pago" defaultValue={row.medio_pago} />
              <Input name="estado" defaultValue={row.estado} />
              <Textarea className="md:col-span-2" name="observaciones" rows={2} defaultValue={row.observaciones ?? ""} />
              <SubmitButton className="h-fit">Guardar</SubmitButton>
            </form>
          ))}
        </div>
      </Card>
    </section>
  );
}
