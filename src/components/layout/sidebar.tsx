"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, canAccess, type Role } from "@/lib/roles";
import { cn } from "@/lib/utils";

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-slate-200 bg-white p-4 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">Cortinas</p>
        <p className="text-lg font-semibold text-slate-900">Panel de Gestion</p>
      </div>

      <nav className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-1">
        {NAV_ITEMS.filter((item) => canAccess(role, item.key)).map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
