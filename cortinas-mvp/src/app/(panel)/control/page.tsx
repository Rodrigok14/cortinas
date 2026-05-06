import { Card } from "@/components/ui/card";
import { ModuleHeader } from "@/components/common/module-header";
import { requireModuleAccess } from "@/lib/auth";
import { money } from "@/lib/utils";
import { getBusinessOverview } from "@/modules/business/queries";

export default async function ControlPage() {
  await requireModuleAccess("control");
  const data = await getBusinessOverview();

  const cards = [
    { label: "Ventas totales", value: money(data.ventaTotal) },
    { label: "Costos ventas", value: money(data.costoTotal) },
    { label: "Ganancia neta", value: money(data.gananciaTotal) },
    { label: "Gastos operativos", value: money(data.gastosTotal) },
    { label: "Resultado final", value: money(data.resultadoNeto) },
  ];

  return (
    <section className="space-y-4">
      <ModuleHeader title="Control Empresa" description="Dashboard de ganancias, perdidas, pedidos y gastos" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label}>
            <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{card.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card><p className="text-xs uppercase tracking-wide text-slate-500">Pedidos realizados</p><p className="text-2xl font-semibold">{data.counts.realizado}</p></Card>
        <Card><p className="text-xs uppercase tracking-wide text-slate-500">Pedidos pendientes</p><p className="text-2xl font-semibold">{data.counts.pendiente}</p></Card>
        <Card><p className="text-xs uppercase tracking-wide text-slate-500">En produccion</p><p className="text-2xl font-semibold">{data.counts.en_produccion}</p></Card>
        <Card><p className="text-xs uppercase tracking-wide text-slate-500">Pedidos entregados</p><p className="text-2xl font-semibold">{data.counts.entregado}</p></Card>
        <Card><p className="text-xs uppercase tracking-wide text-slate-500">Cancelados</p><p className="text-2xl font-semibold">{data.counts.cancelado}</p></Card>
      </div>
    </section>
  );
}
