"use client";

import { Grid2X2, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import { navItems } from "./nav-items";

export function MobileNav() {
  const pathname = usePathname();
  const setQuickCreateOpen = useUiStore((state) => state.setQuickCreateOpen);
  const primaryItems = navItems.slice(0, 4);
  const moreHref = "/knowledge";

  return (
    <nav aria-label="手机主导航" className="fixed inset-x-0 bottom-0 z-30 grid h-[78px] grid-cols-6 border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      {primaryItems.slice(0, 2).map((item) => {
        const href = item.href;
        const Icon = item.icon;
        const selected = pathname === href;
        return (
          <Link key={item.href} href={href} className={cn("flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] text-muted", selected && "text-primary")}>
            <Icon aria-hidden="true" className="size-5 stroke-[1.7]" />
            {item.short}
          </Link>
        );
      })}
      <button aria-label="快速创建" className="mx-auto -mt-5 flex size-14 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-[var(--shadow)]" onClick={() => setQuickCreateOpen(true)} type="button">
        <Plus aria-hidden="true" className="size-6" />
      </button>
      {primaryItems.slice(2).map((item) => {
        const href = item.href;
        const Icon = item.icon;
        const selected = pathname === href;
        return (
          <Link key={item.href} href={href} className={cn("flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] text-muted", selected && "text-primary")}>
            <Icon aria-hidden="true" className="size-5 stroke-[1.7]" />
            {item.short}
          </Link>
        );
      })}
      <Link href={moreHref} className="flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] text-muted">
        <Grid2X2 aria-hidden="true" className="size-5 stroke-[1.7]" />
        更多
      </Link>
    </nav>
  );
}
