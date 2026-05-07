import Image from "next/image";
import { publicWhatsAppHrefCatalog } from "@/lib/whatsapp-public";

const WA_HREF = publicWhatsAppHrefCatalog();

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center overflow-hidden"
      aria-label="Inicio"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg"
          alt="Sala de estar elegante con cortinas a medida"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,28,16,0.82)] via-[rgba(10,28,16,0.55)] to-[rgba(10,28,16,0.18)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.50)] via-transparent to-transparent" />
      </div>

      {/* Floating ambient orbs */}
      <div className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-[rgba(45,122,85,0.15)] blur-[100px] z-0 animate-float" />
      <div className="absolute bottom-1/4 right-1/3 h-64 w-64 rounded-full bg-[rgba(201,145,58,0.12)] blur-[80px] z-0" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 pt-28 pb-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[#4aa872] animate-pulse-ring" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white/90">
              📍 Tucumán, Argentina
            </span>
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-up delay-100 mb-5 text-balance leading-[1.08] text-white"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Cortinas que{" "}
            <span className="italic text-[#e0aa55]">transforman</span>
            <br />
            tu hogar
          </h1>

          {/* Sub */}
          <p className="animate-fade-up delay-200 mb-8 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Diseñamos, fabricamos e instalamos cortinas a medida en toda la provincia de Tucumán.
            Rollers, blackout, tradicionales y más — con instalación incluida.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up delay-300 flex flex-wrap items-center gap-3 mb-10">
            <a href={WA_HREF} target="_blank" rel="noopener noreferrer" className="btn-whatsapp text-sm sm:text-base">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M20.5 3.5A11.8 11.8 0 0 0 12.03 0C5.49 0 .16 5.32.16 11.86c0 2.09.55 4.13 1.59 5.93L0 24l6.38-1.67a11.8 11.8 0 0 0 5.65 1.44h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.24-6.15-3.4-8.41Z"/>
              </svg>
              Pedir cotización gratis
            </a>
            <a href="#catalogo" className="btn-ghost text-sm sm:text-base">
              Ver catálogo
              <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
                <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd"/>
              </svg>
            </a>
          </div>

          {/* Trust badges */}
          <div className="animate-fade-up delay-400 flex flex-wrap gap-4">
            {[
              { icon: "🔧", text: "Instalación incluida" },
              { icon: "📏", text: "100% a medida" },
              { icon: "⚡", text: "Entrega en 7 días" },
              { icon: "🛡️", text: "Garantía de calidad" },
            ].map((b) => (
              <div
                key={b.text}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm"
              >
                <span className="text-sm">{b.icon}</span>
                <span className="text-xs font-medium text-white/90">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-fade-in delay-600 flex flex-col items-center gap-1.5">
        <span className="text-xs font-medium uppercase tracking-widest text-white/50">Explorá</span>
        <div className="h-8 w-5 rounded-full border border-white/30 flex items-start justify-center pt-1.5">
          <div className="h-1.5 w-1 rounded-full bg-white/60 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
