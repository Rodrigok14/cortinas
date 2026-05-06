import { cn } from "@/lib/utils";

type Props = React.TableHTMLAttributes<HTMLTableElement>;

export function Table({ className, ...props }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className={cn("min-w-full border-collapse bg-white text-sm", className)} {...props} />
    </div>
  );
}
