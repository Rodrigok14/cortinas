import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ModuleHeader } from "@/components/common/module-header";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table } from "@/components/ui/table";
import { requireModuleAccess } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { createTaskAction, updateTaskStatusAction } from "@/modules/tasks/actions";
import { getTasks } from "@/modules/tasks/queries";

type Props = { searchParams?: { all?: string } };

export default async function TareasPage({ searchParams }: Props) {
  await requireModuleAccess("tareas");
  const includeDone = searchParams?.all === "1";
  const tasks = await getTasks(includeDone);

  return (
    <section className="space-y-4">
      <ModuleHeader title="Tareas" description="Seguimientos, visitas y pendientes del equipo." />

      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold">Nueva tarea</h2>
          <form action={createTaskAction} className="grid gap-2">
            <Input name="titulo" placeholder="Título (ej: Llamar a Juan)" />
            <Input name="descripcion" placeholder="Descripción (opcional)" />
            <Input name="tipo" placeholder="Tipo (seguimiento/visita/nota)" />
            <div className="grid grid-cols-2 gap-2">
              <Select name="prioridad" defaultValue="media">
                <option value="baja">baja</option>
                <option value="media">media</option>
                <option value="alta">alta</option>
              </Select>
              <Input type="date" name="fecha_vencimiento" />
            </div>
            <SubmitButton>Crear tarea</SubmitButton>
          </form>
        </Card>

        <Card className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Pendientes</h2>
              <p className="text-sm text-slate-600">
                {includeDone ? "Mostrando todas" : "Ocultando completadas/canceladas"}.
              </p>
            </div>
            <a
              className="rounded-xl border bg-white/80 px-3 py-2 text-sm font-semibold"
              href={includeDone ? "/tareas" : "/tareas?all=1"}
            >
              {includeDone ? "Ver solo pendientes" : "Ver todas"}
            </a>
          </div>

          <Table>
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-2 py-2">Título</th>
                <th className="px-2 py-2">Estado</th>
                <th className="px-2 py-2">Prioridad</th>
                <th className="px-2 py-2">Vence</th>
                <th className="px-2 py-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="px-2 py-2">
                    <p className="font-semibold">{t.titulo}</p>
                    <p className="text-xs text-slate-500">{t.tipo ?? "-"}</p>
                  </td>
                  <td className="px-2 py-2 capitalize">{t.estado}</td>
                  <td className="px-2 py-2 capitalize">{t.prioridad}</td>
                  <td className="px-2 py-2">{formatDate(t.fecha_vencimiento)}</td>
                  <td className="px-2 py-2">
                    <form action={updateTaskStatusAction} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={t.id} />
                      <Select name="estado" defaultValue={t.estado}>
                        <option value="pendiente">pendiente</option>
                        <option value="en_progreso">en_progreso</option>
                        <option value="completada">completada</option>
                        <option value="cancelada">cancelada</option>
                      </Select>
                      <button className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold">
                        Guardar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {!tasks.length ? (
                <tr>
                  <td className="px-2 py-4 text-sm text-slate-500" colSpan={5}>
                    No hay tareas.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </Card>
      </div>
    </section>
  );
}

