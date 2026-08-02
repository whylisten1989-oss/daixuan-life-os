"use client";

import { Activity, ChevronRight, Mountain } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@/hooks/use-workspace";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

export function Sidebar() {
  const pathname = usePathname();
  const workspace = useWorkspace();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[190px] flex-col border-r border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--sidebar)_97%,transparent),color-mix(in_srgb,var(--surface-sunken)_94%,transparent))] lg:flex">
      <div className="relative flex h-[74px] items-center gap-3 border-b border-border px-5">
        <div className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-primary/65 via-accent/30 to-transparent" />
        <div className="flex size-9 items-center justify-center border border-line-strong bg-surface text-primary">
          <Mountain aria-hidden="true" className="size-4.5" />
        </div>
        <div>
          <p className="font-semibold tracking-[0.07em]">岱旋 Life OS</p>
          <p className="mt-0.5 text-[8px] uppercase tracking-[0.22em] text-subtle">Daixuan life system</p>
        </div>
      </div>

      <nav aria-label="主导航" className="flex flex-1 flex-col gap-1 px-2.5 py-4">
        {navItems.map((item) => {
          const selected = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={selected ? "page" : undefined}
              className={cn(
                "group relative flex min-h-10 items-center gap-3 overflow-hidden rounded-md px-3 text-[13px] text-muted transition-colors hover:bg-surface-raised/72 hover:text-foreground",
                selected && "text-foreground",
              )}
            >
              {selected ? (
                <>
                  <motion.span
                    layoutId="sidebar-active-surface"
                    className="absolute inset-0 border border-primary/20 bg-gradient-to-r from-primary/13 to-transparent"
                    transition={{ type: "spring", stiffness: 360, damping: 32 }}
                  />
                  <motion.span
                    layoutId="sidebar-active-rail"
                    className="absolute inset-y-2 left-0 w-0.5 bg-primary shadow-[0_0_12px_var(--primary)]"
                    transition={{ type: "spring", stiffness: 360, damping: 32 }}
                  />
                </>
              ) : null}
              <Icon aria-hidden="true" className="relative size-[16px] stroke-[1.65]" />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-2 flex items-center justify-between border-y border-border px-2 py-2 text-[9px] text-muted">
        <span className="flex items-center gap-1.5"><Activity className="size-3 text-success" />系统在线</span>
        <span>RLS 已启用</span>
      </div>

      <div className="m-3 mt-1">
        <Link
          href="/settings"
          className="flex w-full items-center gap-3 border border-border bg-surface/52 p-2.5 text-left transition-colors hover:border-line-strong hover:bg-surface-raised"
        >
          <span className="flex size-8 items-center justify-center bg-accent-soft text-xs font-semibold text-accent">
            {workspace.data?.displayName.slice(0, 1) || "我"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium">{workspace.data?.spaceName || "个人空间"}</span>
            <span className="block truncate text-[10px] text-muted">{workspace.data?.displayName || "加载中…"}</span>
          </span>
          <ChevronRight className="size-3.5 text-subtle" />
        </Link>
      </div>
    </aside>
  );
}
