import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { DashboardInstallation, DashboardMetric, DashboardQuotation } from "@/lib/types";

export async function getDashboardData(): Promise<{
  metrics: DashboardMetric;
  quotations: DashboardQuotation[];
  installations: DashboardInstallation[];
}> {
  const supabase = getSupabaseServerClient();

  const [
    clientsRes,
    quotationsPendingRes,
    projectsInProgressRes,
    installationsRes,
    saldoRes,
    latestQuotationsRes,
    upcomingInstallationsRes,
  ] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase
      .from("quotations")
      .select("id", { count: "exact", head: true })
      .in("estado", ["borrador", "enviada"]),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .in("estado", ["relevamiento", "cotizada", "aprobada", "en_produccion", "lista_para_instalar"]),
    supabase
      .from("installations")
      .select("id", { count: "exact", head: true })
      .in("estado", ["pendiente", "reprogramada"]),
    supabase.from("quotations").select("saldo"),
    supabase
      .from("quotations")
      .select("id, numero, fecha, estado, total, clients(nombre_completo)")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("installations")
      .select("id, fecha_programada, tecnico, estado, projects(nombre_obra)")
      .gte("fecha_programada", new Date().toISOString().slice(0, 10))
      .order("fecha_programada", { ascending: true })
      .limit(8),
  ]);

  const saldoPendiente = (saldoRes.data ?? []).reduce(
    (acc, quotation) => acc + Number(quotation.saldo ?? 0),
    0,
  );

  const quotations: DashboardQuotation[] = (latestQuotationsRes.data ?? []).map((item) => ({
    id: item.id,
    numero: item.numero,
    fecha: item.fecha,
    estado: item.estado,
    total: Number(item.total ?? 0),
    client_name: Array.isArray(item.clients)
      ? item.clients[0]?.nombre_completo ?? null
      : (item.clients as { nombre_completo?: string } | null)?.nombre_completo ?? null,
  }));

  const installations: DashboardInstallation[] = (upcomingInstallationsRes.data ?? []).map((item) => ({
    id: item.id,
    fecha_programada: item.fecha_programada,
    tecnico: item.tecnico,
    estado: item.estado,
    nombre_obra: Array.isArray(item.projects)
      ? item.projects[0]?.nombre_obra ?? null
      : (item.projects as { nombre_obra?: string } | null)?.nombre_obra ?? null,
  }));

  return {
    metrics: {
      totalClientes: clientsRes.count ?? 0,
      cotizacionesPendientes: quotationsPendingRes.count ?? 0,
      obrasEnCurso: projectsInProgressRes.count ?? 0,
      instalacionesProgramadas: installationsRes.count ?? 0,
      saldoPendiente,
    },
    quotations,
    installations,
  };
}
