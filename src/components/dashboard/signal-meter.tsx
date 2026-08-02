import { cn } from "@/lib/utils";

export function SignalMeter({ value, label, tone = "primary" }: { value: number; label: string; tone?: "primary" | "accent" }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex size-16 items-center justify-center rounded-full" style={{ background: `conic-gradient(var(--${tone}) ${value * 3.6}deg, var(--surface-sunken) 0deg)` }}>
        <div className="flex size-12 items-center justify-center rounded-full bg-surface text-sm font-semibold numeric">{value}</div>
      </div>
      <span className={cn("text-xs text-muted", tone === "accent" && "text-accent")}>{label}</span>
    </div>
  );
}
