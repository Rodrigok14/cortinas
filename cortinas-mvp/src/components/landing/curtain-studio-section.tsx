"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DEMO_ROOM =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=85&w=2000&auto=format&fit=crop";

const FABRICS = [
  { id: "f1", file: "/catalog/fabric-01.svg", name: "Esmeralda" },
  { id: "f2", file: "/catalog/fabric-02.svg", name: "Arena" },
  { id: "f3", file: "/catalog/fabric-03.svg", name: "Cacao" },
  { id: "f4", file: "/catalog/fabric-04.svg", name: "Gris perla" },
  { id: "f5", file: "/catalog/fabric-05.svg", name: "Índigo" },
  { id: "f6", file: "/catalog/fabric-06.svg", name: "Terracota" },
] as const;

const STYLES = [
  { id: "drape", label: "Drapé clásico", hint: "Paneles laterales" },
  { id: "roller", label: "Roller", hint: "Barra superior" },
  { id: "sheer", label: "Voile", hint: "Luz filtrada" },
] as const;

type StyleId = (typeof STYLES)[number]["id"];

export function CurtainStudioSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const uploadId = useId();

  const [roomSrc, setRoomSrc] = useState<string>(DEMO_ROOM);
  const [fabric, setFabric] = useState<(typeof FABRICS)[number]>(FABRICS[1]);
  const [style, setStyle] = useState<StyleId>("drape");
  const [open, setOpen] = useState(35);
  const [naturalLight, setNaturalLight] = useState(62);
  const [isNight, setIsNight] = useState(false);

  const onFile = useCallback((fileList: FileList | null) => {
    const f = fileList?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    const url = URL.createObjectURL(f);
    setRoomSrc((prev) => {
      if (prev !== DEMO_ROOM && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const controls = controlsRef.current;
    if (!section || !header || !controls) return;

    const ctx = gsap.context(() => {
      gsap.from(header.querySelectorAll(".studio-reveal"), {
        y: 48,
        opacity: 0,
        duration: 1.05,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: header,
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
      });
      gsap.from(controls.querySelectorAll(".control-card"), {
        y: 36,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: controls,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const openT = open / 100;
  const lightT = naturalLight / 100;
  const panelScale = Math.max(0.06, 1 - openT * 0.92);
  const rollerDrop = Math.max(0, 1 - openT);

  return (
    <section
      ref={sectionRef}
      id="estudio"
      className="relative overflow-hidden bg-[#f4f1eb] py-24 sm:py-32"
      aria-labelledby="estudio-heading"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.5]">
        <div className="absolute -left-40 top-20 h-[520px] w-[520px] rounded-full bg-emerald-200/25 blur-[120px]" />
        <div className="absolute -right-32 bottom-10 h-[480px] w-[480px] rounded-full bg-amber-200/30 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div ref={headerRef} className="mb-14 max-w-3xl">
          <p className="studio-reveal mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-800/80">
            Estudio luminoso
          </p>
          <h2
            id="estudio-heading"
            className="studio-reveal text-balance text-4xl font-semibold tracking-tight text-[#0c1912] sm:text-5xl"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Visualizador inteligente sobre tu ambiente
          </h2>
          <p className="studio-reveal mt-4 max-w-xl text-sm leading-relaxed text-[#5c534a] sm:text-base">
            Subí una foto, elegí tela y estilo, jugá con la luz natural y el día o la noche. La composición se actualiza
            al instante en tu navegador — una experiencia cercana a los visualizadores profesionales de interiorismo.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <motion.div
            layout
            className="relative overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#0a0f0c] shadow-[0_40px_120px_rgba(15,36,25,0.18)]"
          >
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={roomSrc}
                alt="Vista del ambiente para visualizar cortinas"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 65vw"
                priority={false}
                unoptimized={roomSrc.startsWith("blob:")}
              />

              {/* Natural light warmth */}
              <div
                className="pointer-events-none absolute inset-0 mix-blend-soft-light transition-opacity duration-500"
                style={{
                  opacity: 0.25 + lightT * 0.55,
                  background: `radial-gradient(ellipse 85% 70% at 50% 18%, rgba(255, 220, 180, ${0.35 + lightT * 0.4}) 0%, transparent 55%)`,
                }}
              />

              {/* Day / night atmosphere */}
              <AnimatePresence mode="sync">
                {isNight ? (
                  <motion.div
                    key="night"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.85 }}
                    className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-950/55 via-slate-900/35 to-black/65"
                  />
                ) : (
                  <motion.div
                    key="day"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.85 }}
                    className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-100/15 via-transparent to-transparent"
                  />
                )}
              </AnimatePresence>

              {/* Curtains */}
              {style === "drape" && (
                <>
                  <motion.div
                    className="pointer-events-none absolute inset-y-0 left-0 w-[42%] origin-left border-r border-black/10 shadow-[16px_0_48px_rgba(0,0,0,0.22)]"
                    style={{
                      backgroundImage: `url(${fabric.file})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    animate={{ scaleX: panelScale }}
                    transition={{ type: "spring", stiffness: 120, damping: 22 }}
                  />
                  <motion.div
                    className="pointer-events-none absolute inset-y-0 right-0 w-[42%] origin-right border-l border-black/10 shadow-[-16px_0_48px_rgba(0,0,0,0.22)]"
                    style={{
                      backgroundImage: `url(${fabric.file})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    animate={{ scaleX: panelScale }}
                    transition={{ type: "spring", stiffness: 120, damping: 22 }}
                  />
                </>
              )}

              {style === "sheer" && (
                <>
                  <motion.div
                    className="pointer-events-none absolute inset-y-0 left-0 w-[44%] origin-left bg-white/20 backdrop-blur-[2px]"
                    style={{
                      backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.5), transparent), url(${fabric.file})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    animate={{ scaleX: panelScale * 0.95 + 0.05 }}
                    transition={{ type: "spring", stiffness: 100, damping: 24 }}
                  />
                  <motion.div
                    className="pointer-events-none absolute inset-y-0 right-0 w-[44%] origin-right bg-white/20 backdrop-blur-[2px]"
                    style={{
                      backgroundImage: `linear-gradient(270deg, rgba(255,255,255,0.5), transparent), url(${fabric.file})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    animate={{ scaleX: panelScale * 0.95 + 0.05 }}
                    transition={{ type: "spring", stiffness: 100, damping: 24 }}
                  />
                </>
              )}

              {style === "roller" && (
                <motion.div
                  className="pointer-events-none absolute left-[10%] right-[10%] top-0 h-[48%] origin-top rounded-b-[4px] border border-black/15 shadow-[0_28px_60px_rgba(0,0,0,0.28)]"
                  style={{
                    backgroundImage: `url(${fabric.file})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center top",
                  }}
                  animate={{ scaleY: rollerDrop }}
                  transition={{ type: "spring", stiffness: 140, damping: 24 }}
                />
              )}

              {/* Subtle grain */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
                }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-black/55 px-5 py-4 backdrop-blur-xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/55">
                Vista en vivo · {fabric.name} · {STYLES.find((s) => s.id === style)?.label}
              </p>
              <div className="flex gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold text-white/70">
                  {isNight ? "Noche" : "Día"}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold text-white/70">
                  Luz {naturalLight}%
                </span>
              </div>
            </div>
          </motion.div>

          <div ref={controlsRef} className="flex flex-col gap-6">
            <div className="control-card rounded-2xl border border-black/[0.06] bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,36,25,0.06)] backdrop-blur-xl">
              <label htmlFor={uploadId} className="mb-3 block text-xs font-semibold uppercase tracking-widest text-[#3d4f44]">
                Tu foto
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  id={uploadId}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => onFile(e.target.files)}
                />
                <label
                  htmlFor={uploadId}
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-emerald-800/25 bg-emerald-50/40 px-5 py-3 text-sm font-medium text-emerald-900 transition hover:border-emerald-700/40 hover:bg-emerald-50/80"
                >
                  Subir imagen
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRoomSrc((prev) => {
                      if (prev !== DEMO_ROOM && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
                      return DEMO_ROOM;
                    });
                  }}
                  className="text-sm font-medium text-[#6b5e52] underline-offset-4 hover:underline"
                >
                  Usar demo
                </button>
              </div>
            </div>

            <div className="control-card rounded-2xl border border-black/[0.06] bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,36,25,0.06)] backdrop-blur-xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#3d4f44]">Telas</p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
                {FABRICS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFabric(f)}
                    className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition ${
                      fabric.id === f.id
                        ? "border-emerald-700 ring-2 ring-emerald-500/25"
                        : "border-transparent hover:border-black/10"
                    }`}
                  >
                    <Image src={f.file} alt="" fill className="object-cover" sizes="120px" />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-2 py-2 text-left text-[10px] font-semibold text-white">
                      {f.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="control-card rounded-2xl border border-black/[0.06] bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,36,25,0.06)] backdrop-blur-xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#3d4f44]">Estilo</p>
              <div className="flex flex-col gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStyle(s.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                      style === s.id
                        ? "bg-[#0f2419] text-white shadow-lg"
                        : "bg-black/[0.04] text-[#2a2420] hover:bg-black/[0.07]"
                    }`}
                  >
                    <span>{s.label}</span>
                    <span className={`text-xs font-normal ${style === s.id ? "text-white/60" : "text-[#6b5e52]"}`}>
                      {s.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="control-card rounded-2xl border border-black/[0.06] bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,36,25,0.06)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#3d4f44]">Ambiente</p>
                <button
                  type="button"
                  onClick={() => setIsNight((n) => !n)}
                  className={`relative h-9 w-[52px] rounded-full transition ${isNight ? "bg-indigo-900" : "bg-emerald-600"}`}
                  aria-pressed={isNight}
                >
                  <motion.span
                    className="absolute left-1 top-1 h-7 w-7 rounded-full bg-white shadow-md"
                    animate={{ x: isNight ? 22 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                  />
                  <span className="sr-only">Alternar día y noche</span>
                </button>
              </div>

              <label className="mb-3 block text-sm font-medium text-[#2a2420]">
                Apertura · {open}%
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={open}
                  onChange={(e) => setOpen(Number(e.target.value))}
                  className="mt-2 w-full accent-emerald-700"
                />
              </label>

              <label className="block text-sm font-medium text-[#2a2420]">
                Luz natural · {naturalLight}%
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={naturalLight}
                  onChange={(e) => setNaturalLight(Number(e.target.value))}
                  className="mt-2 w-full accent-amber-600"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
