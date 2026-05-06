import { ModuleHeader } from "@/components/common/module-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { requireModuleAccess } from "@/lib/auth";
import {
  createMeasurementAction,
  deleteMeasurementAction,
  updateMeasurementAction,
} from "@/modules/measurements/actions";
import { getMeasurements } from "@/modules/measurements/queries";
import { getRoomOptions } from "@/modules/rooms/queries";

type Props = { searchParams?: { q?: string } };

export default async function MeasurementsPage({ searchParams }: Props) {
  await requireModuleAccess("mediciones");
  const q = searchParams?.q?.trim();

  const [rows, rooms] = await Promise.all([getMeasurements(q), getRoomOptions()]);
  const createAction = createMeasurementAction;

  return (
    <section className="space-y-4">
      <ModuleHeader title="Mediciones" description="Carga de mediciones, optimizada para movil" />

      <Card>
        <form action={createAction} className="grid gap-2 md:grid-cols-4" encType="multipart/form-data">
          <Select name="room_id" required>
            <option value="">Ambiente</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.nombre_ambiente}
              </option>
            ))}
          </Select>
          <Select name="tipo_producto" defaultValue="tradicional">
            <option value="tradicional">Tradicional</option>
            <option value="roller">Roller</option>
          </Select>
          <Select name="tipo_montaje" defaultValue="interior">
            <option value="interior">Interior</option>
            <option value="exterior">Exterior</option>
          </Select>
          <Select name="lado_mando" defaultValue="derecho">
            <option value="izquierdo">Izquierdo</option>
            <option value="derecho">Derecho</option>
            <option value="sin_mando">Sin mando</option>
          </Select>
          <Input name="ancho" type="number" step="0.01" placeholder="Ancho" required />
          <Input name="alto" type="number" step="0.01" placeholder="Alto" required />
          <Input name="cantidad" type="number" placeholder="Cantidad" required />
          <Input name="tela" placeholder="Tela" />
          <Input name="color" placeholder="Color" />
          <Input name="foto" type="file" accept="image/*" />
          <Textarea className="md:col-span-2" name="observaciones" placeholder="Observaciones" rows={2} />
          <div className="md:col-span-4">
            <SubmitButton>Registrar medicion</SubmitButton>
          </div>
        </form>
      </Card>

      <Card>
        <form className="mb-3 flex gap-2" method="get">
          <Input name="q" defaultValue={q} placeholder="Buscar por tela o color" />
          <SubmitButton pendingText="Buscando...">Buscar</SubmitButton>
        </form>
        <Table>
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2">Ambiente</th>
              <th className="px-2 py-2">Producto</th>
              <th className="px-2 py-2">Medidas</th>
              <th className="px-2 py-2">Tela/Color</th>
              <th className="px-2 py-2">Foto</th>
              <th className="px-2 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 align-top">
                <td className="px-2 py-2">{Array.isArray(row.rooms) ? row.rooms[0]?.nombre_ambiente : row.rooms?.nombre_ambiente}</td>
                <td className="px-2 py-2">{row.tipo_producto}</td>
                <td className="px-2 py-2">{row.ancho} x {row.alto} ({row.cantidad})</td>
                <td className="px-2 py-2">{row.tela ?? "-"} / {row.color ?? "-"}</td>
                <td className="px-2 py-2">{row.foto_url ? "Cargada" : "-"}</td>
                <td className="px-2 py-2">
                  <form action={deleteMeasurementAction}>
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
            <form key={row.id} action={updateMeasurementAction} className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-4">
              <input type="hidden" name="id" value={row.id} />
              <Select name="room_id" defaultValue={row.room_id}>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.nombre_ambiente}
                  </option>
                ))}
              </Select>
              <Select name="tipo_producto" defaultValue={row.tipo_producto}>
                <option value="tradicional">Tradicional</option>
                <option value="roller">Roller</option>
              </Select>
              <Input name="ancho" type="number" step="0.01" defaultValue={row.ancho} />
              <Input name="alto" type="number" step="0.01" defaultValue={row.alto} />
              <Input name="cantidad" type="number" defaultValue={row.cantidad} />
              <Input name="tela" defaultValue={row.tela ?? ""} />
              <Input name="color" defaultValue={row.color ?? ""} />
              <Select name="tipo_montaje" defaultValue={row.tipo_montaje}>
                <option value="interior">Interior</option>
                <option value="exterior">Exterior</option>
              </Select>
              <Select name="lado_mando" defaultValue={row.lado_mando}>
                <option value="izquierdo">Izquierdo</option>
                <option value="derecho">Derecho</option>
                <option value="sin_mando">Sin mando</option>
              </Select>
              <Textarea className="md:col-span-3" name="observaciones" defaultValue={row.observaciones ?? ""} rows={2} />
              <SubmitButton className="h-fit">Guardar</SubmitButton>
            </form>
          ))}
        </div>
      </Card>
    </section>
  );
}
