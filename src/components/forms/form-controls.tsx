import type { SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function FormField({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return <label className={cn("flex min-w-0 flex-col gap-2 text-sm", className)}><span className="font-medium">{label}</span>{children}{hint ? <span className="text-xs text-muted">{hint}</span> : null}</label>;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors focus:border-primary", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-24 w-full resize-y rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-subtle focus:border-primary", className)} {...props} />;
}

export function FormStatus({ children, danger = false }: { children?: React.ReactNode; danger?: boolean }) {
  return children ? <p role="status" className={cn("text-sm", danger ? "text-danger" : "text-success")}>{children}</p> : null;
}
