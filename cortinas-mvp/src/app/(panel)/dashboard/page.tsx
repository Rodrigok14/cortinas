import { Card } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { requireModuleAccess } from "@/lib/auth";
import { formatDate, money } from "@/lib/utils";
import { getDashboardData } from "@/modules/dashboard/queries";

export default async function DashboardPage() {
  await requireModuleAccess("dashboard");
  const data = await getDashboardData();

  const cards = [
    { label: "Clientes totales", value: data.metrics.totalClientes.toString() },
    { label: "Cotizaciones pendientes", value: data.metrics.cotizacionesPendientes.toString() },
    { label: "Obras en curso", value: data.metrics.obrasEnCurso.toString() },
    { label: "Instalaciones programadas", value: data.metrics.instalacionesProgramadas.toString() },
    { label: "Saldo pendiente", value: money(data.metrics.saldoPendiente) },
  ];

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-600">Resumen operativo del negocio.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label}>
            <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{card.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Ultimas cotizaciones</h2>
          <Table>
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-2 py-2">Numero</th>
                <th className="px-2 py-2">Cliente</th>
                <th className="px-2 py-2">Fecha</th>
                <th className="px-2 py-2">Estado</th>
                <th className="px-2 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.quotations.map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="px-2 py-2">{row.numero}</td>
                  <td className="px-2 py-2">{row.client_name ?? "-"}</td>
                  <td className="px-2 py-2">{formatDate(row.fecha)}</td>
                  <td className="px-2 py-2 capitalize">{row.estado}</td>
                  <td className="px-2 py-2">{money(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-semibold">Proximas instalaciones</h2>
          <Table>
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-2 py-2">Obra</th>
                <th className="px-2 py-2">Tecnico</th>
                <th className="px-2 py-2">Fecha</th>
                <th className="px-2 py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.installations.map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="px-2 py-2">{row.nombre_obra ?? "-"}</td>
                  <td className="px-2 py-2">{row.tecnico}</td>
                  <td className="px-2 py-2">{formatDate(row.fecha_programada)}</td>
                  <td className="px-2 py-2 capitalize">{row.estado}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </section>
  );
}
