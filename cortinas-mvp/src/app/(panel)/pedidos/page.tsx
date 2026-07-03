import { ModuleHeader } from "@/components/common/module-header";
import { WhatsAppButton } from "@/components/common/whatsapp-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { requireModuleAccess } from "@/lib/auth";
import { getClientOptions } from "@/lib/options";
import { formatDate, money } from "@/lib/utils";
import { createClientAction } from "@/modules/clients/actions";
import { createOrderAction, deleteOrderAction, updateOrderAction } from "@/modules/orders/actions";
import { getOrders } from "@/modules/orders/queries";

const states = ["realizado", "pendiente", "en_produccion", "entregado", "cancelado"];

type Props = { searchParams?: { q?: string } };

export default async function OrdersPage({ searchParams }: Props) {
  await requireModuleAccess("pedidos");
  const q = searchParams?.q?.trim();

  const [rows, clients] = await Promise.all([getOrders(q), getClientOptions()]);

  return (
    <section className="space-y-4">
      <ModuleHeader title="Pedidos" description="Visualizador de pedidos: realizados, pendientes, entregados y mas" />

      <Card className="border-emerald-200 bg-emerald-50/80">
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Cliente nuevo</p>
          <h2 className="text-lg font-semibold text-emerald-950">Crear cliente desde pedidos</h2>
          <p className="text-sm text-emerald-800">
            Cargalo aca y despues lo vas a poder elegir en el selector de cliente del pedido.
          </p>
        </div>
        <form action={createClientAction} className="grid gap-2 md:grid-cols-4">
          <Input name="nombre_completo" placeholder="Nombre completo" required />
          <Input name="telefono" placeholder="Telefono" required />
          <Input name="email" type="email" placeholder="Email opcional" />
          <Input name="ciudad" placeholder="Ciudad" />
          <Input className="md:col-span-2" name="direccion" placeholder="Direccion" />
          <Textarea className="md:col-span-2" name="observaciones" rows={2} placeholder="Observaciones del cliente" />
          <div className="md:col-span-4">
            <SubmitButton>Crear cliente</SubmitButton>
          </div>
        </form>
      </Card>

      <Card>
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Crear pedido</h2>
          <p className="text-sm text-slate-500">Selecciona un cliente existente y carga los datos comerciales del pedido.</p>
        </div>
        <form action={createOrderAction} className="grid gap-2 md:grid-cols-4">
          <Select name="client_id" required>
            <option value="">Cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre_completo}</option>
            ))}
          </Select>
          <Input name="numero" placeholder="Numero pedido" required />
          <Input name="fecha_pedido" type="date" required />
          <Select name="estado" defaultValue="pendiente">{states.map((s) => <option key={s} value={s}>{s}</option>)}</Select>
          <Input name="fecha_entrega_estimada" type="date" />
          <Input name="total_venta" type="number" step="0.01" placeholder="Total venta" required />
          <Input name="costo_total" type="number" step="0.01" placeholder="Costo total" required />
          <Textarea className="md:col-span-4" name="observaciones" rows={2} placeholder="Observaciones" />
          <div className="md:col-span-4"><SubmitButton>Crear pedido</SubmitButton></div>
        </form>
      </Card>

      <Card>
        <form className="mb-3 flex gap-2" method="get">
          <Input name="q" defaultValue={q} placeholder="Buscar por numero o estado" />
          <SubmitButton>Buscar</SubmitButton>
        </form>
        <Table>
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2">Pedido</th>
              <th className="px-2 py-2">Cliente</th>
              <th className="px-2 py-2">Estado</th>
              <th className="px-2 py-2">Venta</th>
              <th className="px-2 py-2">Costo</th>
              <th className="px-2 py-2">Ganancia neta</th>
              <th className="px-2 py-2">WhatsApp</th>
              <th className="px-2 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any) => (
              <tr key={row.id} className="border-b border-slate-100 align-top">
                <td className="px-2 py-2">
                  <p className="font-semibold">{row.numero}</p>
                  <p className="text-xs text-slate-500">{formatDate(row.fecha_pedido)}</p>
                </td>
                <td className="px-2 py-2">{Array.isArray(row.clients) ? row.clients[0]?.nombre_completo : row.clients?.nombre_completo}</td>
                <td className="px-2 py-2"><span className="status-pill border-slate-200 bg-slate-50 text-slate-700">{row.estado}</span></td>
                <td className="px-2 py-2">{money(row.total_venta)}</td>
                <td className="px-2 py-2">{money(row.costo_total)}</td>
                <td className="px-2 py-2 font-semibold">{money(row.ganancia_neta)}</td>
                <td className="px-2 py-2">
                  <WhatsAppButton
                    phone={Array.isArray(row.clients) ? row.clients[0]?.telefono : row.clients?.telefono}
                    message={`Hola, te actualizamos el estado de tu pedido ${row.numero} (${row.estado}).`}
                  />
                </td>
                <td className="px-2 py-2">
                  <form action={deleteOrderAction}>
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
          {rows.slice(0, 8).map((row: any) => (
            <form key={row.id} action={updateOrderAction} className="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-4">
              <input type="hidden" name="id" value={row.id} />
              <Select name="client_id" defaultValue={row.client_id}>{clients.map((c) => <option key={c.id} value={c.id}>{c.nombre_completo}</option>)}</Select>
              <Input name="numero" defaultValue={row.numero} />
              <Input name="fecha_pedido" type="date" defaultValue={row.fecha_pedido} />
              <Select name="estado" defaultValue={row.estado}>{states.map((s) => <option key={s} value={s}>{s}</option>)}</Select>
              <Input name="fecha_entrega_estimada" type="date" defaultValue={row.fecha_entrega_estimada ?? ""} />
              <Input name="total_venta" type="number" step="0.01" defaultValue={row.total_venta} />
              <Input name="costo_total" type="number" step="0.01" defaultValue={row.costo_total} />
              <Textarea className="md:col-span-3" name="observaciones" defaultValue={row.observaciones ?? ""} rows={2} />
              <SubmitButton className="h-fit">Guardar</SubmitButton>
            </form>
          ))}
        </div>
      </Card>
    </section>
  );
}
