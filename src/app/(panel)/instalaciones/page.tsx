import { ModuleHeader } from "@/components/common/module-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { requireModuleAccess } from "@/lib/auth";
import {
  createInstallationAction,
  deleteInstallationAction,
  updateInstallationAction,
} from "@/modules/installations/actions";
import { getInstallations } from "@/modules/installations/queries";
import { getProjectOptions } from "@/modules/projects/queries";

const states = ["pendiente", "reprogramada", "realizada", "observada"];

type Props = { searchParams?: { q?: string } };

export default async function InstallationsPage({ searchParams }: Props) {
  await requireModuleAccess("instalaciones");
  const q = searchParams?.q?.trim();

  const [rows, projects] = await Promise.all([getInstallations(q), getProjectOptions()]);
  const createAction = createInstallationAction;

  return (
    <section className="space-y-4">
      <ModuleHeader title="Instalaciones" description="Planifica y actualiza estado de trabajos" />

      <Card>
        <form action={createAction} className="grid gap-2 md:grid-cols-4">
          <Select name="project_id" required>
            <option value="">Obra</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.nombre_obra}
              </option>
            ))}
          </Select>
          <Input name="fecha_programada" type="date" required />
          <Input name="tecnico" placeholder="Tecnico" required />
          <Select name="estado" defaultValue="pendiente">
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </Select>
          <Textarea className="md:col-span-4" name="observaciones" rows={2} placeholder="Observaciones" />
          <div className="md:col-span-4">
            <SubmitButton>Programar instalacion</SubmitButton>
          </div>
        </form>
      </Card>

      <Card>
        <form className="mb-3 flex gap-2" method="get">
          <Input name="q" defaultValue={q} placeholder="Buscar por tecnico o estado" />
          <SubmitButton pendingText="Buscando...">Buscar</SubmitButton>
        </form>
        <Table>
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2">Obra</th>
              <th className="px-2 py-2">Fecha</th>
              <th className="px-2 py-2">Tecnico</th>
              <th className="px-2 py-2">Estado</th>
              <th className="px-2 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 align-top">
                <td className="px-2 py-2">{Array.isArray(row.projects) ? row.projects[0]?.nombre_obra : row.projects?.nombre_obra}</td>
                <td className="px-2 py-2">{row.fecha_programada}</td>
                <td className="px-2 py-2">{row.tecnico}</td>
                <td className="px-2 py-2">{row.estado}</td>
                <td className="px-2 py-2">
                  <form action={deleteInstallationAction}>
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
            <form key={row.id} action={updateInstallationAction} className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-4">
              <input type="hidden" name="id" value={row.id} />
              <Select name="project_id" defaultValue={row.project_id}>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.nombre_obra}
                  </option>
                ))}
              </Select>
              <Input name="fecha_programada" type="date" defaultValue={row.fecha_programada} />
              <Input name="tecnico" defaultValue={row.tecnico} />
              <Select name="estado" defaultValue={row.estado}>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </Select>
              <Textarea className="md:col-span-3" name="observaciones" rows={2} defaultValue={row.observaciones ?? ""} />
              <SubmitButton className="h-fit">Guardar</SubmitButton>
            </form>
          ))}
        </div>
      </Card>
    </section>
  );
}
