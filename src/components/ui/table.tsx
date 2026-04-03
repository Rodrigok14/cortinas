import { cn } from "@/lib/utils";

type Props = React.TableHTMLAttributes<HTMLTableElement>;

export function Table({ className, ...props }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("min-w-full border-collapse text-sm", className)} {...props} />
    </div>
  );
}
