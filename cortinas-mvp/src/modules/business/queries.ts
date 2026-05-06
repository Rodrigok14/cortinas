import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getBusinessOverview() {
  const supabase = getSupabaseServerClient();

  const [ordersRes, expensesRes] = await Promise.all([
    supabase.from("orders").select("estado, total_venta, costo_total, ganancia_neta"),
    supabase.from("expenses").select("monto"),
  ]);

  const orders = ordersRes.data ?? [];
  const expenses = expensesRes.data ?? [];

  const ventaTotal = orders.reduce((sum, o) => sum + Number(o.total_venta ?? 0), 0);
  const costoTotal = orders.reduce((sum, o) => sum + Number(o.costo_total ?? 0), 0);
  const gananciaTotal = orders.reduce((sum, o) => sum + Number(o.ganancia_neta ?? 0), 0);
  const gastosTotal = expenses.reduce((sum, e) => sum + Number(e.monto ?? 0), 0);

  const counts = {
    realizado: orders.filter((o) => o.estado === "realizado").length,
    pendiente: orders.filter((o) => o.estado === "pendiente").length,
    en_produccion: orders.filter((o) => o.estado === "en_produccion").length,
    entregado: orders.filter((o) => o.estado === "entregado").length,
    cancelado: orders.filter((o) => o.estado === "cancelado").length,
  };

  return {
    ventaTotal,
    costoTotal,
    gananciaTotal,
    gastosTotal,
    resultadoNeto: gananciaTotal - gastosTotal,
    counts,
  };
}
