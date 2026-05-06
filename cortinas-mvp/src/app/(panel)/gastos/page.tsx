import { ModuleHeader } from "@/components/common/module-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table } from "@/components/ui/table";
import { requireModuleAccess } from "@/lib/auth";
import { formatDate, money } from "@/lib/utils";
import { createExpenseAction, deleteExpenseAction, updateExpenseAction } from "@/modules/expenses/actions";
import { getExpenses } from "@/modules/expenses/queries";

type Props = { searchParams?: { q?: string } };

export default async function ExpensesPage({ searchParams }: Props) {
  await requireModuleAccess("gastos");
  const q = searchParams?.q?.trim();
  const rows = await getExpenses(q);

  return (
    <section className="space-y-4">
      <ModuleHeader title="Gastos" description="Control de gastos operativos: empleados, servicios y otros" />

      <Card>
        <form action={createExpenseAction} className="grid gap-2 md:grid-cols-4">
          <Input name="fecha" type="date" required />
          <Input name="categoria" placeholder="Categoria (sueldos, servicios...)" required />
          <Input name="descripcion" placeholder="Descripcion" required />
          <Input name="monto" type="number" step="0.01" placeholder="Monto" required />
          <div className="md:col-span-4"><SubmitButton>Registrar gasto</SubmitButton></div>
        </form>
      </Card>

      <Card>
        <form className="mb-3 flex gap-2" method="get">
          <Input name="q" defaultValue={q} placeholder="Buscar gasto" />
          <SubmitButton>Buscar</SubmitButton>
        </form>
        <Table>
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2">Fecha</th>
              <th className="px-2 py-2">Categoria</th>
              <th className="px-2 py-2">Descripcion</th>
              <th className="px-2 py-2">Monto</th>
              <th className="px-2 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="px-2 py-2">{formatDate(row.fecha)}</td>
                <td className="px-2 py-2">{row.categoria}</td>
                <td className="px-2 py-2">{row.descripcion}</td>
                <td className="px-2 py-2 font-semibold">{money(row.monto)}</td>
                <td className="px-2 py-2">
                  <form action={deleteExpenseAction}>
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
            <form key={row.id} action={updateExpenseAction} className="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-4">
              <input type="hidden" name="id" value={row.id} />
              <Input name="fecha" type="date" defaultValue={row.fecha} />
              <Input name="categoria" defaultValue={row.categoria} />
              <Input name="descripcion" defaultValue={row.descripcion} />
              <Input name="monto" type="number" step="0.01" defaultValue={row.monto} />
              <SubmitButton className="h-fit">Guardar</SubmitButton>
            </form>
          ))}
        </div>
      </Card>
    </section>
  );
}
