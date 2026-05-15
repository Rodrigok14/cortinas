const features = [
  {
    title: "Asesoramiento a medida",
    copy: "Relevamos cada ambiente para definir tela, sistema, caida e instalacion con criterio comercial.",
  },
  {
    title: "Presupuesto claro",
    copy: "Cada propuesta separa ambientes, medidas y subtotales para que el cliente entienda que esta comprando.",
  },
  {
    title: "Gestion completa",
    copy: "Del primer contacto a la instalacion final, el proceso queda ordenado para vender y ejecutar mejor.",
  },
];

export function FeaturesSection() {
  return (
    <section className="section-padding bg-[#f7f3ec]" id="beneficios">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <span className="mb-2 inline-block rounded-full border border-[rgba(26,92,58,0.2)] bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#1a5c3a]">
            Beneficios
          </span>
          <h2 className="text-3xl font-bold text-[#0f2419] sm:text-4xl" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
            Venta profesional, ejecucion ordenada
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-lg border border-[rgba(15,36,25,0.12)] bg-white p-5">
              <h3 className="text-lg font-semibold text-[#0f2419]">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#6b5e52]">{feature.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
