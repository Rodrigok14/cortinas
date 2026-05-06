import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingText?: string;
};

export function SubmitButton({
  className,
  children,
  pendingText: _pendingText,
  ...props
}: Props) {
  return (
    <button
      type="submit"
      className={cn(
        "btn-vivid inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
