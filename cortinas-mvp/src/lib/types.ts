export type DashboardMetric = {
  totalClientes: number;
  cotizacionesPendientes: number;
  obrasEnCurso: number;
  instalacionesProgramadas: number;
  saldoPendiente: number;
};

export type DashboardQuotation = {
  id: string;
  numero: string;
  fecha: string;
  estado: string;
  total: number;
  client_name: string | null;
};

export type DashboardInstallation = {
  id: string;
  fecha_programada: string;
  tecnico: string;
  estado: string;
  nombre_obra: string | null;
};
