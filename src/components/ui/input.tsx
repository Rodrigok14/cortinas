import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200",
        className,
      )}
      {...props}
    />
  );
}
