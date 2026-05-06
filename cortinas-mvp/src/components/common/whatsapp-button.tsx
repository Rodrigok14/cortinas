import Link from "next/link";

function toWhatsappPhone(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

export function WhatsAppButton({
  phone,
  message,
}: {
  phone: string | null | undefined;
  message?: string;
}) {
  if (!phone) return <span className="text-xs text-slate-400">Sin telefono</span>;

  const normalized = toWhatsappPhone(phone);
  if (!normalized) return <span className="text-xs text-slate-400">Telefono invalido</span>;

  const text = encodeURIComponent(message ?? "Hola, te escribimos de CortinasHome.");
  const href = `https://wa.me/${normalized}?text=${text}`;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-current">
        <path d="M20.5 3.5A11.8 11.8 0 0 0 12.03 0C5.49 0 .16 5.32.16 11.86c0 2.09.55 4.13 1.59 5.93L0 24l6.38-1.67a11.8 11.8 0 0 0 5.65 1.44h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.24-6.15-3.4-8.41ZM12.04 21.7h-.01a9.76 9.76 0 0 1-4.97-1.36l-.36-.21-3.79.99 1.01-3.69-.24-.38a9.77 9.77 0 0 1-1.5-5.2C2.2 6.44 6.63 2 12.03 2c2.61 0 5.05 1.01 6.9 2.86a9.68 9.68 0 0 1 2.85 6.9c0 5.4-4.4 9.8-9.75 9.94Zm5.36-7.3c-.29-.15-1.72-.85-1.98-.95-.27-.1-.46-.15-.66.15-.19.29-.76.95-.93 1.14-.17.19-.34.22-.62.07-.29-.15-1.2-.44-2.3-1.4-.85-.76-1.43-1.7-1.6-1.98-.17-.3-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.36-.02-.51-.07-.15-.66-1.6-.9-2.2-.24-.57-.48-.49-.66-.5h-.56c-.2 0-.51.07-.78.36-.27.29-1.03 1-1.03 2.44 0 1.43 1.06 2.82 1.2 3.01.15.2 2.08 3.18 5.03 4.46.7.31 1.25.5 1.67.64.7.22 1.34.19 1.84.11.56-.08 1.72-.7 1.97-1.37.24-.67.24-1.25.17-1.37-.07-.12-.26-.2-.55-.34Z" />
      </svg>
      WhatsApp
    </Link>
  );
}
