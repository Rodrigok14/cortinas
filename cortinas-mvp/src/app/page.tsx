import Link from "next/link";
import { CatalogGrid } from "@/components/catalog/catalog-grid";
import { catalogItems } from "@/modules/catalog/items";

export default async function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:pt-14">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/40 bg-white/45 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
            Cortinas a medida · Catálogo demo
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Elegí tu tela y estilo. Nosotros lo hacemos realidad.
          </h1>
          <p className="text-pretty text-sm leading-relaxed text-slate-700 sm:text-base">
            Explorá telas y cortinas con un efecto 3D moderno: pasá el mouse para inclinar, o
            arrastrá para “girar” la tarjeta. Luego cotizamos y coordinamos la visita.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <Link href="/login" className="btn-vivid px-4 py-2 text-sm font-semibold">
              Entrar al panel
            </Link>
            <Link
              href="https://wa.me/"
              className="btn-warm px-4 py-2 text-sm font-semibold"
              target="_blank"
              rel="noopener noreferrer"
            >
              Consultar por WhatsApp
            </Link>
            <a
              href="#catalogo"
              className="rounded-xl border border-white/50 bg-white/50 px-4 py-2 text-sm font-semibold text-slate-800 backdrop-blur transition hover:bg-white/70"
            >
              Ver catálogo
            </a>
          </div>
        </div>

        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/40 bg-white/45 p-4 shadow-[0_22px_80px_rgba(15,23,42,0.10)] backdrop-blur">
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-emerald-300/30 blur-3xl" />
          <div className="absolute -bottom-28 -right-24 h-64 w-64 rounded-full bg-orange-300/30 blur-3xl" />
          <div className="relative space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Cómo usar el efecto 3D
            </p>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>
                <span className="font-semibold text-slate-900">Hover</span>: inclinación suave con
                luz y profundidad.
              </li>
              <li>
                <span className="font-semibold text-slate-900">Drag</span>: mantené apretado y
                mové para girar.
              </li>
              <li>
                <span className="font-semibold text-slate-900">Mobile</span>: tocá y arrastrá.
              </li>
            </ul>
          </div>
        </div>
      </header>

      <section id="catalogo" className="mt-10 space-y-4 sm:mt-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Catálogo</h2>
            <p className="text-sm text-slate-600">
              12 modelos demo (placeholders). Próximo paso: reemplazar por fotos reales.
            </p>
          </div>
          <p className="text-xs font-semibold text-slate-500">
            Tip: si te marea, activá “reducir movimiento” en el sistema.
          </p>
        </div>

        <CatalogGrid items={catalogItems} />
      </section>

      <footer className="mt-14 rounded-2xl border border-white/40 bg-white/45 p-5 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">¿Querés una cotización rápida?</p>
            <p className="text-sm text-slate-600">
              Entrá al panel (admin) o escribinos por WhatsApp.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/login" className="btn-vivid px-4 py-2 text-sm font-semibold">
              Panel / Admin
            </Link>
            <Link
              href="https://wa.me/"
              className="btn-warm px-4 py-2 text-sm font-semibold"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
