import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
