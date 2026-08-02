import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-subtle transition-colors focus:border-primary focus:outline-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
