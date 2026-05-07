/**
 * WhatsApp comercial público (landing, catálogo, cotizador → negocio).
 * Configurar en Vercel: NEXT_PUBLIC_WHATSAPP_PHONE=549XXXXXXXXXX (con o sin + / espacios).
 */

export function getPublicWhatsAppDigits(): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.trim();
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length > 0 ? digits : null;
}

export function buildPublicWhatsAppUrl(encodedMessage: string): string | null {
  const digits = getPublicWhatsAppDigits();
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodedMessage}`;
}

export const WA_MESSAGE_CATALOG = encodeURIComponent(
  "Hola CortinasHome! Vi el catálogo en la web y quiero consultar por cortinas a medida en Tucumán. ¿Me ayudás con una cotización?",
);

export const WA_MESSAGE_FREE_QUOTE = encodeURIComponent(
  "Hola CortinasHome! Quiero pedir una cotización gratuita para cortinas a medida en Tucumán.",
);

export const WA_MESSAGE_DEFAULT = encodeURIComponent(
  "Hola CortinasHome! Quiero consultar por cortinas a medida.",
);

export function publicWhatsAppHrefCatalog(): string {
  return buildPublicWhatsAppUrl(WA_MESSAGE_CATALOG) ?? "#contacto";
}

export function publicWhatsAppHrefFreeQuote(): string {
  return buildPublicWhatsAppUrl(WA_MESSAGE_FREE_QUOTE) ?? "#contacto";
}

export function publicWhatsAppHrefDefault(): string {
  return buildPublicWhatsAppUrl(WA_MESSAGE_DEFAULT) ?? "#contacto";
}
