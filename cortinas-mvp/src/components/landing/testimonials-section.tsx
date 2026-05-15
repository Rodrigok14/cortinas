const testimonials = [
  {
    quote: "Nos ordenaron todo el presupuesto por ambientes y la instalacion fue muy prolija.",
    name: "Cliente residencial",
  },
  {
    quote: "La propuesta fue clara desde el inicio, con medidas y alternativas bien explicadas.",
    name: "Proyecto comercial",
  },
];

export function TestimonialsSection() {
  return (
    <section className="section-padding bg-white" id="testimonios">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <span className="mb-2 inline-block rounded-full border border-[rgba(26,92,58,0.2)] bg-[rgba(26,92,58,0.06)] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#1a5c3a]">
            Opiniones
          </span>
          <h2 className="text-3xl font-bold text-[#0f2419] sm:text-4xl" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
            Clientes que buscan claridad
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {testimonials.map((item) => (
            <figure key={item.name} className="rounded-lg border border-[rgba(15,36,25,0.12)] bg-[#fbfaf7] p-6">
              <blockquote className="text-base leading-7 text-[#0f2419]">&ldquo;{item.quote}&rdquo;</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-[#1a5c3a]">{item.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
