import { ModuleHeader } from "@/components/common/module-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { requireModuleAccess } from "@/lib/auth";
import { money } from "@/lib/utils";
import { createCostAction, deleteCostAction, updateCostAction } from "@/modules/costs/actions";
import { getCosts } from "@/modules/costs/queries";

type Props = { searchParams?: { q?: string } };

export default async function CostsPage({ searchParams }: Props) {
  await requireModuleAccess("costos");
  const q = searchParams?.q?.trim();
  const rows = await getCosts(q);

  return (
    <section className="space-y-4">
      <ModuleHeader title="Costos" description="Costos variables de productos para control de ganancia" />

      <Card>
        <form action={createCostAction} className="grid gap-2 md:grid-cols-4">
          <Input name="categoria" placeholder="Categoria" required />
          <Input name="producto" placeholder="Producto" required />
          <Input name="costo_unitario" type="number" step="0.01" placeholder="Costo unitario" required />
          <Input name="unidad" placeholder="Unidad (m, m2, un)" required />
          <Textarea name="observaciones" className="md:col-span-4" rows={2} placeholder="Observaciones" />
          <div className="md:col-span-4"><SubmitButton>Agregar costo</SubmitButton></div>
        </form>
      </Card>

      <Card>
        <form className="mb-3 flex gap-2" method="get">
          <Input name="q" defaultValue={q} placeholder="Buscar costo" />
          <SubmitButton>Buscar</SubmitButton>
        </form>
        <Table>
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2">Categoria</th>
              <th className="px-2 py-2">Producto</th>
              <th className="px-2 py-2">Costo</th>
              <th className="px-2 py-2">Unidad</th>
              <th className="px-2 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="px-2 py-2">{row.categoria}</td>
                <td className="px-2 py-2">{row.producto}</td>
                <td className="px-2 py-2">{money(row.costo_unitario)}</td>
                <td className="px-2 py-2">{row.unidad}</td>
                <td className="px-2 py-2">
                  <form action={deleteCostAction}>
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
          {rows.slice(0, 10).map((row: any) => (
            <form key={row.id} action={updateCostAction} className="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-4">
              <input type="hidden" name="id" value={row.id} />
              <Input name="categoria" defaultValue={row.categoria} />
              <Input name="producto" defaultValue={row.producto} />
              <Input name="costo_unitario" type="number" step="0.01" defaultValue={row.costo_unitario} />
              <Input name="unidad" defaultValue={row.unidad} />
              <Textarea className="md:col-span-3" name="observaciones" defaultValue={row.observaciones ?? ""} rows={2} />
              <SubmitButton className="h-fit">Guardar</SubmitButton>
            </form>
          ))}
        </div>
      </Card>
    </section>
  );
}
