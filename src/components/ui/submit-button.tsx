"use client";

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
        "inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
