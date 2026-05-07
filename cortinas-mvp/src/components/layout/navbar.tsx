"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { publicWhatsAppHrefDefault } from "@/lib/whatsapp-public";

const NAV_LINKS = [
  { href: "#estudio", label: "Visualizador" },
  { href: "#catalogo", label: "Catálogo" },
  { href: "#tipos", label: "Tipos" },
  { href: "#proceso", label: "Cómo funciona" },
  { href: "#contacto", label: "Contacto" },
];

const WA_HREF = publicWhatsAppHrefDefault();

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const onLanding = pathname === "/";
  const lightOnHero = onLanding && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[rgba(253,251,247,0.88)] backdrop-blur-xl shadow-[0_2px_32px_rgba(15,36,25,0.10)] border-b border-white/50"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-[0_4px_14px_rgba(26,92,58,0.35)] transition group-hover:shadow-[0_6px_20px_rgba(26,92,58,0.45)] ${
              lightOnHero
                ? "border border-white/30 bg-white/15 backdrop-blur-md"
                : "bg-gradient-to-br from-[#1a5c3a] to-[#2d7a55]"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className={`h-5 w-5 ${lightOnHero ? "fill-emerald-100" : "fill-white"}`}
              aria-hidden="true"
            >
              <path d="M4 2h2v20H4V2zm3 0h1v20H7V2zm2 0h2v20H9V2zm3 0h1v20h-1V2zm2 0h2v20h-2V2zm3 0h1v20h-1V2zm2 0h2v20h-2V2z" opacity=".6"/>
              <rect x="3" y="1" width="18" height="3" rx="1"/>
              <rect x="3" y="20" width="18" height="3" rx="1"/>
            </svg>
          </div>
          <div className="leading-none">
            <span
              className="block text-lg font-bold tracking-tight"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                color: lightOnHero ? "rgba(255,255,255,0.96)" : "#0f2419",
              }}
            >
              CortinasHome
            </span>
            <span
              className={`block text-[10px] font-medium tracking-widest uppercase ${
                lightOnHero ? "text-emerald-200/90" : "text-[#2d7a55]"
              }`}
            >
              Tucumán
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  lightOnHero
                    ? "text-white/88 hover:bg-white/12 hover:text-white"
                    : "text-[#1c1410] hover:bg-[rgba(26,92,58,0.08)] hover:text-[#1a5c3a]"
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA + Mobile toggle */}
        <div className="flex items-center gap-3">
          <a
            href={WA_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex btn-whatsapp text-sm px-4 py-2.5"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M20.5 3.5A11.8 11.8 0 0 0 12.03 0C5.49 0 .16 5.32.16 11.86c0 2.09.55 4.13 1.59 5.93L0 24l6.38-1.67a11.8 11.8 0 0 0 5.65 1.44h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.24-6.15-3.4-8.41Z"/>
            </svg>
            Cotización gratis
          </a>

          {/* Hamburger */}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Abrir menú"
            className={`lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border backdrop-blur transition ${
              lightOnHero
                ? "border-white/35 bg-white/10 hover:bg-white/18"
                : "border-white/40 bg-white/50 hover:bg-white/70"
            }`}
          >
            <span
              className={`block h-0.5 w-5 transition-all ${lightOnHero ? "bg-white" : "bg-[#0f2419]"} ${open ? "rotate-45 translate-y-1.5" : ""}`}
            />
            <span
              className={`absolute block h-0.5 w-5 transition-all ${lightOnHero ? "bg-white" : "bg-[#0f2419]"} ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 transition-all ${lightOnHero ? "bg-white" : "bg-[#0f2419]"} ${open ? "-rotate-45 -translate-y-1" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-white/40 bg-[rgba(253,251,247,0.95)] backdrop-blur-xl px-4 pb-4 pt-2">
          <ul className="flex flex-col gap-1 mb-3">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-4 py-2.5 text-sm font-medium text-[#1c1410] transition hover:bg-[rgba(26,92,58,0.08)] hover:text-[#1a5c3a]"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={WA_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp w-full justify-center text-sm py-2.5"
            onClick={() => setOpen(false)}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M20.5 3.5A11.8 11.8 0 0 0 12.03 0C5.49 0 .16 5.32.16 11.86c0 2.09.55 4.13 1.59 5.93L0 24l6.38-1.67a11.8 11.8 0 0 0 5.65 1.44h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.24-6.15-3.4-8.41Z"/>
            </svg>
            Cotización gratis por WhatsApp
          </a>
        </div>
      )}
    </nav>
  );
}
