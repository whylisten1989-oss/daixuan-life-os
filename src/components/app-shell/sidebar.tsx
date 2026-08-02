"use client";

import { ChevronLeft, Command, Mountain } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

export function Sidebar({ demo = false }: { demo?: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[208px] flex-col border-r border-border bg-sidebar lg:flex">
      <div className="flex h-20 items-center gap-3 px-5">
        <div className="flex size-9 items-center justify-center rounded-md border border-line-strong bg-surface text-primary">
          <Mountain aria-hidden="true" />
        </div>
        <div>
          <p className="font-semibold tracking-[0.08em]">岱旋 Life OS</p>
          <p className="text-[10px] uppercase tracking-[0.22em] text-subtle">Daixuan</p>
        </div>
      </div>

      <nav aria-label="主导航" className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const href = demo ? item.demoHref : item.href;
          const selected = pathname === href || (href !== "/demo" && pathname.startsWith(`${href}/`));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={href}
              aria-current={selected ? "page" : undefined}
              className={cn(
                "group relative flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-muted transition-colors hover:bg-surface-raised hover:text-foreground",
                selected && "bg-surface-raised text-foreground",
              )}
            >
              {selected ? <span className="absolute inset-y-2 -left-3 w-0.5 bg-primary" /> : null}
              <Icon aria-hidden="true" className="size-[18px] stroke-[1.7]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="m-3 border-t border-border pt-4">
        <button className="flex w-full items-center gap-3 rounded-md p-3 text-left hover:bg-surface-raised" type="button">
          <span className="flex size-9 items-center justify-center rounded-md bg-accent-soft text-sm font-semibold text-accent">岱</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">个人空间</span>
            <span className="block text-xs text-muted">岱旋</span>
          </span>
          <ChevronLeft aria-hidden="true" className="size-4 rotate-180 text-subtle" />
        </button>
        <div className="mt-2 flex items-center gap-2 px-3 py-2 text-[11px] text-subtle">
          <Command aria-hidden="true" className="size-3.5" />
          <span>⌘ K 快速创建</span>
        </div>
      </div>
    </aside>
  );
}
