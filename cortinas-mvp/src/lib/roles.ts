export const ROLES = ["admin", "vendedor", "medidor", "instalador"] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrador",
  vendedor: "Vendedor",
  medidor: "Medidor",
  instalador: "Instalador",
};

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: [
    "dashboard",
    "clientes",
    "pagos",
    "cotizador",
    "seguimiento",
    "pedidos",
    "costos",
    "gastos",
    "finanzas",
    "proveedores",
    "compras",
    "cuentas-pagar",
    "sueldos",
    "leads",
    "tareas",
    "inversores",
    "control",
  ],
  vendedor: ["dashboard", "clientes", "pagos", "cotizador", "seguimiento", "pedidos", "control"],
  medidor: ["dashboard"],
  instalador: ["dashboard"],
};

export const NAV_ITEMS = [
  { href: "/dashboard", key: "dashboard", label: "Dashboard" },
  { href: "/leads", key: "leads", label: "Leads" },
  { href: "/tareas", key: "tareas", label: "Tareas" },
  { href: "/clientes", key: "clientes", label: "Clientes" },
  { href: "/pedidos", key: "pedidos", label: "Pedidos" },
  { href: "/pagos", key: "pagos", label: "Pagos" },
  { href: "/cotizador", key: "cotizador", label: "Cotizador" },
  { href: "/seguimiento", key: "seguimiento", label: "Seguimiento" },
  { href: "/costos", key: "costos", label: "Costos" },
  { href: "/gastos", key: "gastos", label: "Gastos" },
  { href: "/finanzas", key: "finanzas", label: "Reportes" },
  { href: "/proveedores", key: "proveedores", label: "Proveedores" },
  { href: "/compras", key: "compras", label: "Compras" },
  { href: "/cuentas-pagar", key: "cuentas-pagar", label: "Cuentas x pagar" },
  { href: "/sueldos", key: "sueldos", label: "Sueldos" },
  { href: "/inversores", key: "inversores", label: "Inversores" },
  { href: "/control", key: "control", label: "Control" },
] as const;

export function canAccess(role: Role, moduleKey: string): boolean {
  return ROLE_PERMISSIONS[role].includes(moduleKey);
}
