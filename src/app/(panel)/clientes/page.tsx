import { ModuleHeader } from "@/components/common/module-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { requireModuleAccess } from "@/lib/auth";
import {
  createClientAction,
  deleteClientAction,
  updateClientAction,
} from "@/modules/clients/actions";
import { getClients } from "@/modules/clients/queries";

type Props = { searchParams?: { q?: string } };

export default async function ClientsPage({ searchParams }: Props) {
  await requireModuleAccess("clientes");

  const q = searchParams?.q?.trim();
  const rows = await getClients(q);
  const createAction = createClientAction;

  return (
    <section className="space-y-4">
      <ModuleHeader title="Clientes" description="Gestion completa de clientes" />

      <Card>
        <form className="grid gap-2 md:grid-cols-4" action={createAction}>
          <Input name="nombre_completo" placeholder="Nombre completo" required />
          <Input name="telefono" placeholder="Telefono" required />
          <Input name="email" placeholder="Email" type="email" />
          <Input name="ciudad" placeholder="Ciudad" />
          <Input name="direccion" placeholder="Direccion" className="md:col-span-2" />
          <Textarea name="observaciones" placeholder="Observaciones" className="md:col-span-2" rows={2} />
          <div className="md:col-span-4">
            <SubmitButton>Crear cliente</SubmitButton>
          </div>
        </form>
      </Card>

      <Card>
        <form className="mb-3 flex gap-2" method="get">
          <Input name="q" defaultValue={q} placeholder="Buscar por nombre, telefono o email" />
          <SubmitButton pendingText="Buscando...">Buscar</SubmitButton>
        </form>

        <Table>
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2">Nombre</th>
              <th className="px-2 py-2">Telefono</th>
              <th className="px-2 py-2">Email</th>
              <th className="px-2 py-2">Ciudad</th>
              <th className="px-2 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 align-top">
                <td className="px-2 py-2">{row.nombre_completo}</td>
                <td className="px-2 py-2">{row.telefono}</td>
                <td className="px-2 py-2">{row.email ?? "-"}</td>
                <td className="px-2 py-2">{row.ciudad ?? "-"}</td>
                <td className="px-2 py-2">
                  <div className="flex gap-2">
                    <form action={deleteClientAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <button className="rounded-lg border border-rose-200 px-2 py-1 text-xs text-rose-700">
                        Eliminar
                      </button>
                    </form>
                  </div>
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
            <form key={row.id} action={updateClientAction} className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-5">
              <input type="hidden" name="id" value={row.id} />
              <Input name="nombre_completo" defaultValue={row.nombre_completo} required />
              <Input name="telefono" defaultValue={row.telefono} required />
              <Input name="email" defaultValue={row.email ?? ""} type="email" />
              <Input name="ciudad" defaultValue={row.ciudad ?? ""} />
              <SubmitButton className="h-fit">Guardar</SubmitButton>
              <Input name="direccion" defaultValue={row.direccion ?? ""} className="md:col-span-2" />
              <Textarea name="observaciones" defaultValue={row.observaciones ?? ""} rows={2} className="md:col-span-3" />
            </form>
          ))}
        </div>
      </Card>
    </section>
  );
}
