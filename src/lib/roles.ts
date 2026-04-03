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
    "obras",
    "ambientes",
    "mediciones",
    "cotizaciones",
    "items-cotizacion",
    "instalaciones",
    "pagos",
  ],
  vendedor: ["dashboard", "clientes", "cotizaciones", "items-cotizacion", "pagos"],
  medidor: ["dashboard", "obras", "ambientes", "mediciones"],
  instalador: ["dashboard", "obras", "instalaciones"],
};

export const NAV_ITEMS = [
  { href: "/dashboard", key: "dashboard", label: "Dashboard" },
  { href: "/clientes", key: "clientes", label: "Clientes" },
  { href: "/obras", key: "obras", label: "Obras" },
  { href: "/ambientes", key: "ambientes", label: "Ambientes" },
  { href: "/mediciones", key: "mediciones", label: "Mediciones" },
  { href: "/cotizaciones", key: "cotizaciones", label: "Cotizaciones" },
  { href: "/items-cotizacion", key: "items-cotizacion", label: "Items cotizacion" },
  { href: "/instalaciones", key: "instalaciones", label: "Instalaciones" },
  { href: "/pagos", key: "pagos", label: "Pagos" },
] as const;

export function canAccess(role: Role, moduleKey: string): boolean {
  return ROLE_PERMISSIONS[role].includes(moduleKey);
}
