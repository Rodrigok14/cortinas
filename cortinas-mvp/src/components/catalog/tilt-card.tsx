"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  imageSrc: string;
  tags?: string[];
  className?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export function TiltCard({ title, subtitle, imageSrc, tags, className }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [rotation, setRotation] = useState({ rx: 0, ry: 0 });
  const [rm, setRm] = useState(false);

  useEffect(() => {
    setRm(prefersReducedMotion());
  }, []);

  const maxTilt = useMemo(() => (dragging ? 14 : 10), [dragging]);
  const maxDrag = 18;

  function setFromPoint(clientX: number, clientY: number) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    const ry = (x - 0.5) * (maxTilt * 2);
    const rx = (0.5 - y) * (maxTilt * 2);
    setRotation({ rx: clamp(rx, -maxTilt, maxTilt), ry: clamp(ry, -maxTilt, maxTilt) });
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (rm) return;
    if (!dragging && e.pointerType !== "mouse") return;
    setFromPoint(e.clientX, e.clientY);
  }

  function onPointerEnter(e: React.PointerEvent<HTMLDivElement>) {
    if (rm) return;
    if (e.pointerType === "mouse") setFromPoint(e.clientX, e.clientY);
  }

  function onPointerLeave() {
    setDragging(false);
    if (rm) return;
    setRotation({ rx: 0, ry: 0 });
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (rm) return;
    setDragging(true);
    ref.current?.setPointerCapture(e.pointerId);
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    setDragging(false);
    try {
      ref.current?.releasePointerCapture(e.pointerId);
    } catch {}
    if (rm) return;
    setRotation((prev) => ({
      rx: clamp(prev.rx * 0.65, -maxDrag, maxDrag),
      ry: clamp(prev.ry * 0.65, -maxDrag, maxDrag),
    }));
  }

  const transform = rm
    ? undefined
    : `perspective(900px) rotateX(${rotation.rx}deg) rotateY(${rotation.ry}deg) translateZ(0)`;

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={title}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      className={cn(
        "group relative select-none rounded-2xl border border-white/30 bg-white/55 p-3 shadow-[0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl transition",
        "hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(15,23,42,0.16)]",
        "focus:outline-none focus:ring-2 focus:ring-emerald-500/40",
        className,
      )}
      style={{
        transform,
        transformStyle: rm ? undefined : "preserve-3d",
        transition: rm ? undefined : dragging ? "transform 0ms linear" : "transform 220ms ease",
        cursor: dragging ? "grabbing" : "grab",
      }}
    >
      <div
        className="relative overflow-hidden rounded-xl"
        style={{ transform: rm ? undefined : "translateZ(22px)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/10 opacity-0 transition group-hover:opacity-100" />
        <Image
          src={imageSrc}
          alt={title}
          width={1200}
          height={800}
          className="h-44 w-full rounded-xl object-cover transition duration-300 group-hover:scale-[1.03]"
          priority={false}
        />
      </div>

      <div className="mt-3 space-y-1" style={{ transform: rm ? undefined : "translateZ(18px)" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">{title}</p>
            {subtitle ? <p className="text-xs text-slate-600">{subtitle}</p> : null}
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            3D
          </span>
        </div>

        {tags?.length ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-full border border-slate-200/70 bg-white/70 px-2 py-0.5 text-[11px] font-medium text-slate-700"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-1 ring-black/5 transition group-hover:opacity-100"
      />
    </div>
  );
}

