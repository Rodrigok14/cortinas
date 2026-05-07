import { ModuleHeader } from "@/components/common/module-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { requireModuleAccess } from "@/lib/auth";
import { formatDate, money } from "@/lib/utils";
import { createInvestorAction, deleteInvestorAction, updateInvestorAction } from "@/modules/investors/actions";
import { getInvestors } from "@/modules/investors/queries";

const states = ["pendiente", "pagado", "vencido"];

type Props = { searchParams?: { q?: string } };

type InvestorRow = {
  id: string;
  nombre: string;
  dia_pago: number;
  monto_invertido: number;
  porcentaje_inversion: number;
  monto_neto: number;
  fecha_a_pagar: string;
  estado: string;
  observaciones: string | null;
};

function percent(value: number) {
  return `${Number(value ?? 0).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}%`;
}

export default async function InvestorsPage({ searchParams }: Props) {
  await requireModuleAccess("inversores");
  const q = searchParams?.q?.trim();
  const rows = (await getInvestors(q)) as InvestorRow[];

  const today = new Date().toISOString().slice(0, 10);
  const totalInvertido = rows.reduce((sum, row) => sum + Number(row.monto_invertido ?? 0), 0);
  const totalNeto = rows.reduce((sum, row) => sum + Number(row.monto_neto ?? 0), 0);
  const pendientes = rows.filter((row) => row.estado === "pendiente").length;
  const vencidos = rows.filter((row) => row.estado !== "pagado" && row.fecha_a_pagar < today).length;

  return (
    <section className="space-y-4">
      <ModuleHeader title="Inversores" description="Control de inversores, montos, porcentajes y fechas de pago" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Monto invertido</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{money(totalInvertido)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Monto neto</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{money(totalNeto)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Pagos pendientes</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{pendientes}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500">Vencidos</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{vencidos}</p>
        </Card>
      </div>

      <Card>
        <form action={createInvestorAction} className="grid gap-2 md:grid-cols-4">
          <Input name="nombre" placeholder="Nombre del inversor" required />
          <Input name="dia_pago" type="number" min="1" max="31" placeholder="Dia de pago" required />
          <Input name="monto_invertido" type="number" step="0.01" placeholder="Monto invertido" required />
          <Input name="porcentaje_inversion" type="number" step="0.01" min="0" max="100" placeholder="% inversion" required />
          <Input name="monto_neto" type="number" step="0.01" placeholder="Monto neto" required />
          <Input name="fecha_a_pagar" type="date" required />
          <Select name="estado" defaultValue="pendiente">
            {states.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </Select>
          <Textarea name="observaciones" placeholder="Observaciones" className="md:col-span-4" rows={2} />
          <div className="md:col-span-4"><SubmitButton>Registrar inversor</SubmitButton></div>
        </form>
      </Card>

      <Card>
        <form className="mb-3 flex gap-2" method="get">
          <Input name="q" defaultValue={q} placeholder="Buscar por inversor o estado" />
          <SubmitButton>Buscar</SubmitButton>
        </form>
        <Table>
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2">Inversor</th>
              <th className="px-2 py-2">Dia pago</th>
              <th className="px-2 py-2">Invertido</th>
              <th className="px-2 py-2">% inversion</th>
              <th className="px-2 py-2">Monto neto</th>
              <th className="px-2 py-2">Fecha a pagar</th>
              <th className="px-2 py-2">Estado</th>
              <th className="px-2 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 align-top">
                <td className="px-2 py-2">
                  <p className="font-semibold">{row.nombre}</p>
                  {row.observaciones ? <p className="text-xs text-slate-500">{row.observaciones}</p> : null}
                </td>
                <td className="px-2 py-2">{row.dia_pago}</td>
                <td className="px-2 py-2">{money(row.monto_invertido)}</td>
                <td className="px-2 py-2">{percent(row.porcentaje_inversion)}</td>
                <td className="px-2 py-2 font-semibold">{money(row.monto_neto)}</td>
                <td className="px-2 py-2">{formatDate(row.fecha_a_pagar)}</td>
                <td className="px-2 py-2"><span className="status-pill border-slate-200 bg-slate-50 text-slate-700">{row.estado}</span></td>
                <td className="px-2 py-2">
                  <form action={deleteInvestorAction}>
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
          {rows.slice(0, 10).map((row) => (
            <form key={row.id} action={updateInvestorAction} className="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-4">
              <input type="hidden" name="id" value={row.id} />
              <Input name="nombre" defaultValue={row.nombre} required />
              <Input name="dia_pago" type="number" min="1" max="31" defaultValue={row.dia_pago} required />
              <Input name="monto_invertido" type="number" step="0.01" defaultValue={row.monto_invertido} required />
              <Input name="porcentaje_inversion" type="number" step="0.01" min="0" max="100" defaultValue={row.porcentaje_inversion} required />
              <Input name="monto_neto" type="number" step="0.01" defaultValue={row.monto_neto} required />
              <Input name="fecha_a_pagar" type="date" defaultValue={row.fecha_a_pagar} required />
              <Select name="estado" defaultValue={row.estado}>
                {states.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </Select>
              <SubmitButton className="h-fit">Guardar</SubmitButton>
              <Textarea name="observaciones" defaultValue={row.observaciones ?? ""} rows={2} className="md:col-span-4" />
            </form>
          ))}
        </div>
      </Card>
    </section>
  );
}
