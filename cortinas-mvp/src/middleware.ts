import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const protectedPaths = [
  "/dashboard",
  "/clientes",
  "/obras",
  "/ambientes",
  "/mediciones",
  "/cotizaciones",
  "/items-cotizacion",
  "/instalaciones",
  "/pagos",
  "/cotizador",
  "/pedidos",
  "/costos",
  "/gastos",
  "/finanzas",
  "/proveedores",
  "/compras",
  "/cuentas-pagar",
  "/sueldos",
  "/inversores",
  "/control",
];

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  updateSession(request, response);

  const path = request.nextUrl.pathname;
  const isProtected = protectedPaths.some((item) => path === item || path.startsWith(`${item}/`));

  if (!isProtected) {
    return response;
  }

  const hasSbCookie = request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));

  if (!hasSbCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
