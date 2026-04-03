import { cn } from "@/lib/utils";

export function FlashMessage({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) return null;

  return (
    <div
      className={cn(
        "mb-4 rounded-lg border px-3 py-2 text-sm",
        error
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700",
      )}
    >
      {error ?? success}
    </div>
  );
}
