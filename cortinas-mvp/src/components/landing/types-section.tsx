const types = [
  "Cortinas de genero",
  "Roller blackout",
  "Roller sunscreen",
  "Bandas verticales",
];

export function TypesSection() {
  return (
    <section className="section-padding bg-white" id="tipos">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="mb-2 inline-block rounded-full border border-[rgba(26,92,58,0.2)] bg-[rgba(26,92,58,0.06)] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#1a5c3a]">
              Tipos
            </span>
            <h2 className="text-3xl font-bold text-[#0f2419] sm:text-4xl" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
              Soluciones para cada ambiente
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6b5e52]">
              Trabajamos opciones livianas, pesadas, blackout y sunscreen para equilibrar luz, privacidad y terminacion.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {types.map((type) => (
              <div key={type} className="rounded-lg border border-[rgba(15,36,25,0.12)] bg-[#fbfaf7] px-5 py-4 text-sm font-semibold text-[#0f2419]">
                {type}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
