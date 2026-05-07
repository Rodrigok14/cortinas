import Link from "next/link";
import { publicWhatsAppHrefDefault } from "@/lib/whatsapp-public";

const WA_HREF = publicWhatsAppHrefDefault();

const NAV_COL_1 = [
  { href: "#catalogo", label: "Catálogo" },
  { href: "#tipos", label: "Tipos de cortinas" },
  { href: "#proceso", label: "Cómo funciona" },
  { href: "#testimonios", label: "Testimonios" },
];

const NAV_COL_2 = [
  { href: "#beneficios", label: "Por qué elegirnos" },
  { href: "#contacto", label: "Contacto" },
  { href: "/login", label: "Panel admin" },
];

export function FooterSection() {
  return (
    <footer className="relative overflow-hidden bg-[#0f2419]">
      {/* Decorative top border */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-40 w-96 rounded-full bg-[rgba(45,122,85,0.12)] blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 mb-12">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a5c3a] to-[#2d7a55] shadow-[0_4px_14px_rgba(26,92,58,0.4)]">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
                  <path d="M4 2h2v20H4V2zm3 0h1v20H7V2zm2 0h2v20H9V2zm3 0h1v20h-1V2zm2 0h2v20h-2V2zm3 0h1v20h-1V2zm2 0h2v20h-2V2z" opacity=".6"/>
                  <rect x="3" y="1" width="18" height="3" rx="1"/>
                  <rect x="3" y="20" width="18" height="3" rx="1"/>
                </svg>
              </div>
              <div>
                <span
                  className="block text-xl font-bold text-white"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  CortinasHome
                </span>
                <span className="block text-[10px] font-medium uppercase tracking-widest text-[#4aa872]">
                  Tucumán, Argentina
                </span>
              </div>
            </div>

            <p className="mb-6 max-w-xs text-sm leading-relaxed text-white/55">
              Fabricación e instalación de cortinas a medida en toda la provincia de Tucumán.
              Calidad, rapidez y atención personalizada.
            </p>

            {/* WhatsApp CTA */}
            <a
              href={WA_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25d366] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(37,211,102,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(37,211,102,0.38)]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M20.5 3.5A11.8 11.8 0 0 0 12.03 0C5.49 0 .16 5.32.16 11.86c0 2.09.55 4.13 1.59 5.93L0 24l6.38-1.67a11.8 11.8 0 0 0 5.65 1.44h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.24-6.15-3.4-8.41Z"/>
              </svg>
              Escribinos por WhatsApp
            </a>
          </div>

          {/* Links col 1 */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Navegación</p>
            <ul className="space-y-2.5">
              {NAV_COL_1.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-sm text-white/60 transition hover:text-white"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links col 2 + Info */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Más info</p>
            <ul className="space-y-2.5 mb-6">
              {NAV_COL_2.map((l) => (
                <li key={l.href}>
                  {l.href.startsWith("#") ? (
                    <a href={l.href} className="text-sm text-white/60 transition hover:text-white">
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className="text-sm text-white/60 transition hover:text-white">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Zona de cobertura</p>
            <p className="text-sm text-white/55">
              📍 Toda la provincia de Tucumán
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} CortinasHome · Tucumán, Argentina
          </p>
          <p className="text-xs text-white/25">
            Diseño y desarrollo web personalizado
          </p>
        </div>
      </div>
    </footer>
  );
}
