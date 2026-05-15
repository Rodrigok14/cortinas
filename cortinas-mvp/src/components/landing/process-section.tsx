const steps = [
  "Contacto y datos del domicilio",
  "Medicion y seleccion de producto",
  "Presupuesto unificado",
  "Produccion e instalacion",
];

export function ProcessSection() {
  return (
    <section className="section-padding bg-[#eef4ed]" id="proceso">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <span className="mb-2 inline-block rounded-full border border-[rgba(26,92,58,0.2)] bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#1a5c3a]">
          Proceso
        </span>
        <h2 className="text-3xl font-bold text-[#0f2419] sm:text-4xl" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
          De la consulta a la instalacion
        </h2>
        <div className="mt-8 grid gap-3 md:grid-cols-4">
          {steps.map((step, index) => (
            <article key={step} className="rounded-lg border border-[rgba(15,36,25,0.12)] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1a5c3a]">Paso {index + 1}</p>
              <h3 className="mt-3 text-base font-semibold text-[#0f2419]">{step}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
