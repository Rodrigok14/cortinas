export function ModuleHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}
