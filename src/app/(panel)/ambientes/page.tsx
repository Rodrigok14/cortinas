import { ModuleHeader } from "@/components/common/module-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { requireModuleAccess } from "@/lib/auth";
import { createRoomAction, deleteRoomAction, updateRoomAction } from "@/modules/rooms/actions";
import { getRooms } from "@/modules/rooms/queries";
import { getProjectOptions } from "@/modules/projects/queries";

type Props = { searchParams?: { q?: string } };

export default async function RoomsPage({ searchParams }: Props) {
  await requireModuleAccess("ambientes");
  const q = searchParams?.q?.trim();

  const [rows, projects] = await Promise.all([getRooms(q), getProjectOptions()]);
  const createAction = createRoomAction;

  return (
    <section className="space-y-4">
      <ModuleHeader title="Ambientes" description="Administra ambientes por obra" />

      <Card>
        <form action={createAction} className="grid gap-2 md:grid-cols-3">
          <Select name="project_id" required>
            <option value="">Obra</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.nombre_obra}
              </option>
            ))}
          </Select>
          <Input name="nombre_ambiente" placeholder="Nombre ambiente" required />
          <Textarea name="observaciones" placeholder="Observaciones" rows={2} />
          <div className="md:col-span-3">
            <SubmitButton>Crear ambiente</SubmitButton>
          </div>
        </form>
      </Card>

      <Card>
        <form className="mb-3 flex gap-2" method="get">
          <Input name="q" defaultValue={q} placeholder="Buscar ambiente" />
          <SubmitButton pendingText="Buscando...">Buscar</SubmitButton>
        </form>
        <Table>
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2">Ambiente</th>
              <th className="px-2 py-2">Obra</th>
              <th className="px-2 py-2">Observaciones</th>
              <th className="px-2 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 align-top">
                <td className="px-2 py-2">{row.nombre_ambiente}</td>
                <td className="px-2 py-2">{Array.isArray(row.projects) ? row.projects[0]?.nombre_obra : row.projects?.nombre_obra}</td>
                <td className="px-2 py-2">{row.observaciones ?? "-"}</td>
                <td className="px-2 py-2">
                  <form action={deleteRoomAction}>
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
            <form key={row.id} action={updateRoomAction} className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-3">
              <input type="hidden" name="id" value={row.id} />
              <Select name="project_id" defaultValue={row.project_id}>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.nombre_obra}
                  </option>
                ))}
              </Select>
              <Input name="nombre_ambiente" defaultValue={row.nombre_ambiente} required />
              <Textarea name="observaciones" defaultValue={row.observaciones ?? ""} rows={2} />
              <SubmitButton className="h-fit">Guardar</SubmitButton>
            </form>
          ))}
        </div>
      </Card>
    </section>
  );
}
