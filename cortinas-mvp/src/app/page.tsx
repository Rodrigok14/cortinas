import { Navbar } from "@/components/layout/navbar";
import { SmoothScrollProvider } from "@/components/landing/smooth-scroll-provider";
import { PremiumHero } from "@/components/landing/premium-hero";
import { CurtainStudioSection } from "@/components/landing/curtain-studio-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { TypesSection } from "@/components/landing/types-section";
import { ProcessSection } from "@/components/landing/process-section";
import { CatalogGrid } from "@/components/catalog/catalog-grid";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { CtaBanner } from "@/components/landing/cta-banner";
import { FooterSection } from "@/components/landing/footer-section";
import { catalogItems } from "@/modules/catalog/items";
import { getPublicWhatsAppDigits } from "@/lib/whatsapp-public";

export default function Home() {
  const whatsappPhone = getPublicWhatsAppDigits();

  return (
    <SmoothScrollProvider>
      {/* Fixed Navbar */}
      <Navbar />

      <main>
        {/* 1. Hero — before/after cinematográfico + WebGL */}
        <PremiumHero />

        {/* 2. Estudio — visualizador, telas, luz, día/noche */}
        <CurtainStudioSection />

        {/* 3. Beneficios — por qué elegirnos */}
        <FeaturesSection />

        {/* 4. Tipos de cortinas — visual e inspiracional */}
        <TypesSection />

        {/* 5. Proceso — reduce la fricción de compra */}
        <ProcessSection />

        {/* 6. Catálogo — con filtros y CTA por producto */}
        <section id="catalogo" className="section-padding">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            {/* Section header */}
            <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="mb-2 inline-block rounded-full border border-[rgba(26,92,58,0.2)] bg-[rgba(26,92,58,0.06)] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#1a5c3a]">
                  Catálogo
                </span>
                <h2
                  className="text-3xl sm:text-4xl font-bold text-[#0f2419]"
                  style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                >
                  Explorá nuestros modelos
                </h2>
                <p className="mt-1.5 text-sm text-[#6b5e52]">
                  Pasá el cursor sobre cada tarjeta para ver el efecto 3D.
                </p>
              </div>
              <p className="text-xs text-[#6b5e52] opacity-70 shrink-0">
                {catalogItems.length} modelos disponibles
              </p>
            </div>

            <CatalogGrid items={catalogItems} whatsappPhone={whatsappPhone} />
          </div>
        </section>

        {/* 7. Testimonios */}
        <TestimonialsSection />

        {/* 8. CTA final — máxima conversión */}
        <CtaBanner />
      </main>

      {/* Footer */}
      <FooterSection />
    </SmoothScrollProvider>
  );
}
