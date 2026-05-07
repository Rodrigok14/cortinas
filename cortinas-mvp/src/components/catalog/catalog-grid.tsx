"use client";

import { TiltCard } from "@/components/catalog/tilt-card";
import type { CatalogItem } from "@/modules/catalog/items";

export function CatalogGrid({
  items,
  whatsappPhone,
}: {
  items: CatalogItem[];
  whatsappPhone?: string | null;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <TiltCard
          key={item.id}
          title={item.name}
          subtitle={item.kind === "tela" ? "Tela (catálogo)" : "Cortina (demo)"}
          imageSrc={item.imageSrc}
          tags={item.tags}
          whatsappPhone={whatsappPhone}
        />
      ))}
    </div>
  );
}

