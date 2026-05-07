"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { publicWhatsAppHrefFreeQuote } from "@/lib/whatsapp-public";
import { AmbientWebGLBackdrop } from "./ambient-webgl-backdrop";

const IMG_BEFORE =
  "https://images.unsplash.com/photo-1600210492493-0946911123ea?q=85&w=2400&auto=format&fit=crop";
const IMG_AFTER =
  "https://images.unsplash.com/photo-1615875476705-e9e31c79c0b9?q=85&w=2400&auto=format&fit=crop";

const WA_HREF = publicWhatsAppHrefFreeQuote();

export function PremiumHero() {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const spotlightX = useSpring(mx, { stiffness: 28, damping: 18, mass: 0.4 });
  const spotlightY = useSpring(my, { stiffness: 28, damping: 18, mass: 0.4 });
  const spotlight = useMotionTemplate`radial-gradient(650px circle at ${spotlightX}% ${spotlightY}%, rgba(255,255,255,0.14), transparent 55%)`;

  return (
    <section
      id="inicio"
      className="relative min-h-[100svh] overflow-hidden bg-[#050a08]"
      aria-label="Inicio"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 100);
        my.set(((e.clientY - r.top) / r.height) * 100);
      }}
    >
      <div className="absolute inset-0 z-0">
        <ReactCompareSlider
          className="h-[100svh] w-full [&>div]:h-full"
          itemOne={
            <ReactCompareSliderImage
              src={IMG_BEFORE}
              alt="Ambiente con luz natural antes de instalar cortinas"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          }
          itemTwo={
            <ReactCompareSliderImage
              src={IMG_AFTER}
              alt="Mismo tipo de ambiente con cortinas elegantes instaladas"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          }
          changePositionOnHover
          transition="0.45s cubic-bezier(0.22, 1, 0.36, 1)"
          defaultPosition={52}
          handle={
            <div className="flex h-full w-1 items-stretch justify-center">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/35 bg-white/12 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/25 to-transparent" />
                <svg viewBox="0 0 24 24" className="relative h-7 w-7 text-white/95" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M8.5 6.5 3 12l5.5 5.5 1.06-1.06L5.12 12l4.44-4.44L8.5 6.5Zm7 0L14.44 7.56 18.88 12l-4.44 4.44L15.5 17.5 21 12l-5.5-5.5Z"
                  />
                </svg>
              </div>
            </div>
          }
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/40" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-black/25" />
        <motion.div className="pointer-events-none absolute inset-0 z-[2]" style={{ background: spotlight }} />
      </div>

      <AmbientWebGLBackdrop className="z-[1] mix-blend-screen opacity-90" />

      <div className="pointer-events-none absolute left-6 top-28 z-[4] sm:left-10">
        <span className="rounded-full border border-white/25 bg-black/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur-md">
          Sin cortinas
        </span>
      </div>
      <div className="pointer-events-none absolute right-6 top-28 z-[4] sm:right-10">
        <span className="rounded-full border border-white/25 bg-black/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80 backdrop-blur-md">
          Con cortinas
        </span>
      </div>

      <div className="relative z-[5] mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-end px-4 pb-16 pt-32 sm:px-6 sm:pb-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/85">
              Tucumán · Interior premium
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mb-5 text-balance text-white"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(2.5rem, 6.5vw, 4.75rem)",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            El ritual de la luz,
            <br />
            <span className="bg-gradient-to-r from-amber-100/95 via-white to-emerald-100/90 bg-clip-text text-transparent">
              diseñado para tu espacio
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 max-w-md text-sm leading-relaxed text-white/75 sm:text-base"
          >
            Mové el cursor sobre el hero para cruzar dos mundos: la ventana desnuda y el abrigo de las cortinas.
            Más abajo, subí tu foto y ensayá telas en tiempo real.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex flex-wrap items-center gap-3"
          >
            <a
              href="#estudio"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/18"
            >
              Visualizador
              <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href={WA_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(16,185,129,0.35)] transition hover:shadow-[0_16px_48px_rgba(16,185,129,0.45)]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
                <path d="M20.5 3.5A11.8 11.8 0 0 0 12.03 0C5.49 0 .16 5.32.16 11.86c0 2.09.55 4.13 1.59 5.93L0 24l6.38-1.67a11.8 11.8 0 0 0 5.65 1.44h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.24-6.15-3.4-8.41Z" />
              </svg>
              Cotización gratis
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="pointer-events-none mt-14 flex items-end justify-between gap-6 border-t border-white/10 pt-6 text-white/45"
        >
          <p className="max-w-xs text-[11px] leading-relaxed tracking-wide">
            Inspirado en experiencias Apple / Tesla: silencio visual, contraste preciso, una sola acción clara a la vez.
          </p>
          <div className="hidden sm:flex items-center gap-3">
            <Image src="/catalog/curtain-01.svg" alt="" width={36} height={36} className="opacity-50" />
            <Image src="/catalog/fabric-02.svg" alt="" width={36} height={36} className="opacity-50" />
            <Image src="/catalog/curtain-03.svg" alt="" width={36} height={36} className="opacity-50" />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.6 }}
        className="pointer-events-none absolute bottom-8 left-1/2 z-[5] flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/40">Descubrí</span>
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-white/25 pt-2">
          <motion.div
            className="h-1 w-1 rounded-full bg-white/70"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
