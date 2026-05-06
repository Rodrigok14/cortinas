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
    "pedidos",
    "costos",
    "gastos",
    "control",
  ],
  vendedor: ["dashboard", "clientes", "pagos", "cotizador", "pedidos", "control"],
  medidor: ["dashboard"],
  instalador: ["dashboard"],
};

export const NAV_ITEMS = [
  { href: "/dashboard", key: "dashboard", label: "Dashboard" },
  { href: "/clientes", key: "clientes", label: "Clientes" },
  { href: "/pedidos", key: "pedidos", label: "Pedidos" },
  { href: "/pagos", key: "pagos", label: "Pagos" },
  { href: "/cotizador", key: "cotizador", label: "Cotizador" },
  { href: "/costos", key: "costos", label: "Costos" },
  { href: "/gastos", key: "gastos", label: "Gastos" },
  { href: "/control", key: "control", label: "Control" },
] as const;

export function canAccess(role: Role, moduleKey: string): boolean {
  return ROLE_PERMISSIONS[role].includes(moduleKey);
}
