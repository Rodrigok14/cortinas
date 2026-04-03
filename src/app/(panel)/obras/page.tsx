import { ModuleHeader } from "@/components/common/module-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { requireModuleAccess } from "@/lib/auth";
import { getClientOptions } from "@/lib/options";
import {
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
} from "@/modules/projects/actions";
import { getProjects } from "@/modules/projects/queries";

const projectStates = [
  "relevamiento",
  "cotizada",
  "aprobada",
  "en_produccion",
  "lista_para_instalar",
  "instalada",
  "cerrada",
];

type Props = { searchParams?: { q?: string } };

export default async function ProjectsPage({ searchParams }: Props) {
  await requireModuleAccess("obras");
  const q = searchParams?.q?.trim();

  const [rows, clients] = await Promise.all([getProjects(q), getClientOptions()]);
  const createAction = createProjectAction;

  return (
    <section className="space-y-4">
      <ModuleHeader title="Obras" description="Cada obra pertenece a un cliente" />

      <Card>
        <form action={createAction} className="grid gap-2 md:grid-cols-4">
          <Select name="client_id" required>
            <option value="">Cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.nombre_completo}
              </option>
            ))}
          </Select>
          <Input name="nombre_obra" placeholder="Nombre de obra" required />
          <Input name="direccion_instalacion" placeholder="Direccion instalacion" />
          <Select name="estado" defaultValue="relevamiento">
            {projectStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </Select>
          <Input name="fecha_visita" type="date" />
          <Input name="fecha_entrega_estimada" type="date" />
          <Textarea className="md:col-span-2" name="observaciones" placeholder="Observaciones" rows={2} />
          <div className="md:col-span-4">
            <SubmitButton>Crear obra</SubmitButton>
          </div>
        </form>
      </Card>

      <Card>
        <form className="mb-3 flex gap-2" method="get">
          <Input name="q" defaultValue={q} placeholder="Buscar obra" />
          <SubmitButton pendingText="Buscando...">Buscar</SubmitButton>
        </form>
        <Table>
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2">Obra</th>
              <th className="px-2 py-2">Cliente</th>
              <th className="px-2 py-2">Estado</th>
              <th className="px-2 py-2">Entrega</th>
              <th className="px-2 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 align-top">
                <td className="px-2 py-2">{row.nombre_obra}</td>
                <td className="px-2 py-2">{Array.isArray(row.clients) ? row.clients[0]?.nombre_completo : row.clients?.nombre_completo}</td>
                <td className="px-2 py-2">{row.estado}</td>
                <td className="px-2 py-2">{row.fecha_entrega_estimada ?? "-"}</td>
                <td className="px-2 py-2">
                  <form action={deleteProjectAction}>
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
            <form key={row.id} action={updateProjectAction} className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-4">
              <input type="hidden" name="id" value={row.id} />
              <Select name="client_id" defaultValue={row.client_id} required>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nombre_completo}
                  </option>
                ))}
              </Select>
              <Input name="nombre_obra" defaultValue={row.nombre_obra} required />
              <Input name="direccion_instalacion" defaultValue={row.direccion_instalacion ?? ""} />
              <Select name="estado" defaultValue={row.estado}>
                {projectStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </Select>
              <Input name="fecha_visita" type="date" defaultValue={row.fecha_visita ?? ""} />
              <Input name="fecha_entrega_estimada" type="date" defaultValue={row.fecha_entrega_estimada ?? ""} />
              <Textarea className="md:col-span-2" name="observaciones" defaultValue={row.observaciones ?? ""} rows={2} />
              <SubmitButton className="h-fit">Guardar</SubmitButton>
            </form>
          ))}
        </div>
      </Card>
    </section>
  );
}
