import { publicWhatsAppHrefFreeQuote } from "@/lib/whatsapp-public";

const WA_HREF = publicWhatsAppHrefFreeQuote();

export function CtaBanner() {
  return (
    <section
      id="contacto"
      className="relative overflow-hidden"
      aria-label="Contacto"
    >
      {/* BG */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#c9913a] via-[#d4a04a] to-[#b87d28]" />

      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative orbs */}
      <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[rgba(26,92,58,0.25)] blur-3xl" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28 text-center">
        {/* Badge */}
        <span className="mb-6 inline-block rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
          ¡Cotización gratuita!
        </span>

        {/* Headline */}
        <h2
          className="mb-5 text-balance text-4xl sm:text-6xl font-bold text-white leading-tight"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          ¿Listo para transformar
          <br />
          <span className="italic">tu hogar?</span>
        </h2>

        <p className="mb-10 mx-auto max-w-lg text-base text-white/80 leading-relaxed">
          Escribinos por WhatsApp y te respondemos en el día con el precio exacto
          para tus cortinas. Sin visitas, sin compromiso.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={WA_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-xl bg-white px-7 py-3.5 text-base font-bold text-[#1a5c3a] shadow-[0_8px_32px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.30)]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#25d366]" aria-hidden="true">
              <path d="M20.5 3.5A11.8 11.8 0 0 0 12.03 0C5.49 0 .16 5.32.16 11.86c0 2.09.55 4.13 1.59 5.93L0 24l6.38-1.67a11.8 11.8 0 0 0 5.65 1.44h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.24-6.15-3.4-8.41Z"/>
            </svg>
            Pedir cotización gratis
          </a>
          <a
            href="#catalogo"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 bg-white/15 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/25 hover:-translate-y-1"
          >
            Ver catálogo
          </a>
        </div>

        {/* Micro trust */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-white/65 text-sm">
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 20 20" className="h-4 w-4 fill-white/70" aria-hidden="true">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
            Sin compromiso
          </span>
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 20 20" className="h-4 w-4 fill-white/70" aria-hidden="true">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
            Respuesta en el día
          </span>
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 20 20" className="h-4 w-4 fill-white/70" aria-hidden="true">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
            Cubrimos todo Tucumán
          </span>
        </div>
      </div>
    </section>
  );
}
