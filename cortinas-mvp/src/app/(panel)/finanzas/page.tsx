import { Card } from "@/components/ui/card";
import { ModuleHeader } from "@/components/common/module-header";
import { Table } from "@/components/ui/table";
import { requireModuleAccess } from "@/lib/auth";
import { formatDate, money } from "@/lib/utils";
import { getCashflowMonthly, getPlMonthly } from "@/modules/finance/queries";

export default async function FinanzasPage() {
  await requireModuleAccess("finanzas");

  const [pl, cashflow] = await Promise.all([getPlMonthly(12), getCashflowMonthly(12)]);

  const current = pl[0];
  const cards = [
    { label: "Ingresos (mes)", value: money(Number(current?.ingresos ?? 0)) },
    { label: "COGS (mes)", value: money(Number(current?.costos_directos ?? 0)) },
    { label: "OPEX (mes)", value: money(Number(current?.gastos_operativos ?? 0)) },
    { label: "Resultado (mes)", value: money(Number(current?.resultado_neto ?? 0)) },
  ];

  return (
    <section className="space-y-4">
      <ModuleHeader
        title="Finanzas"
        description="Reportes mensuales (cash) basados en ledger: P&L y flujo de caja."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{card.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-lg font-semibold">Estado de resultados (P&L)</h2>
          <Table>
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-2 py-2">Mes</th>
                <th className="px-2 py-2">Ingresos</th>
                <th className="px-2 py-2">COGS</th>
                <th className="px-2 py-2">OPEX</th>
                <th className="px-2 py-2">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {pl.map((row) => (
                <tr key={row.month} className="border-b border-slate-100">
                  <td className="px-2 py-2">{formatDate(row.month)}</td>
                  <td className="px-2 py-2">{money(Number(row.ingresos))}</td>
                  <td className="px-2 py-2">{money(Number(row.costos_directos))}</td>
                  <td className="px-2 py-2">{money(Number(row.gastos_operativos))}</td>
                  <td className="px-2 py-2 font-semibold">{money(Number(row.resultado_neto))}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-semibold">Flujo de caja</h2>
          <Table>
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-2 py-2">Mes</th>
                <th className="px-2 py-2">Ingresos</th>
                <th className="px-2 py-2">Egresos</th>
                <th className="px-2 py-2">Neto</th>
              </tr>
            </thead>
            <tbody>
              {cashflow.map((row) => (
                <tr key={row.month} className="border-b border-slate-100">
                  <td className="px-2 py-2">{formatDate(row.month)}</td>
                  <td className="px-2 py-2">{money(Number(row.ingresos_caja))}</td>
                  <td className="px-2 py-2">{money(Number(row.egresos_caja))}</td>
                  <td className="px-2 py-2 font-semibold">{money(Number(row.neto_caja))}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </section>
  );
}

