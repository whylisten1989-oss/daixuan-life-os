import type { LucideIcon } from "lucide-react";

export function ModuleHeader({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-5 border-b border-line-strong pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex size-10 items-center justify-center rounded-md border border-line-strong bg-surface text-primary"><Icon aria-hidden="true" /></div>
        <div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1><p className="mt-1 text-sm text-muted">{description}</p></div>
      </div>
      {action}
    </header>
  );
}
