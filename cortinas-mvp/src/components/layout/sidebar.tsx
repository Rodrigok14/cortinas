"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, canAccess, type Role } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/branding";

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-emerald-700/60 bg-gradient-to-b from-emerald-700 via-emerald-700 to-teal-700 p-4 text-slate-100 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div className="mb-6 rounded-2xl border border-emerald-300/40 bg-white/10 p-4 backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-[#edf4e8]">Panel comercial</p>
        <p className="text-xl font-semibold text-white">{BRAND.name}</p>
        <p className="mt-1 text-xs text-[#edf4e8]">Panel comercial y operativo</p>
      </div>

      <nav className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-1">
        {NAV_ITEMS.filter((item) => canAccess(role, item.key)).map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "border-orange-300/70 bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-[0_10px_24px_rgba(251,146,60,0.35)]"
                  : "border-emerald-300/30 bg-white/10 text-[#f3f8f0] hover:border-orange-300/60 hover:bg-white/20",
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
