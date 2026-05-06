export function ModuleHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 rounded-2xl border border-slate-200/80 bg-white/90 px-5 py-4 shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Modulo</p>
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}
