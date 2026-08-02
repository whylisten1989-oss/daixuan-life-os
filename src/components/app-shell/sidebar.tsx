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
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[220px] flex-col border-r border-border bg-sidebar lg:flex">
      <div className="relative flex h-[84px] items-center gap-3 border-b border-border px-5">
        <div className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-primary/70 via-accent/35 to-transparent" />
        <div className="flex size-10 items-center justify-center border border-line-strong bg-surface text-primary shadow-[0_0_28px_-12px_var(--primary)]">
          <Mountain aria-hidden="true" className="size-5" />
        </div>
        <div>
          <p className="font-semibold tracking-[0.08em]">岱旋 Life OS</p>
          <p className="mt-0.5 text-[9px] uppercase tracking-[0.24em] text-subtle">Personal command system</p>
        </div>
      </div>

      <nav aria-label="主导航" className="flex flex-1 flex-col gap-1 px-3 py-5">
        {navItems.map((item) => {
          const selected = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={selected ? "page" : undefined}
              className={cn(
                "group relative flex min-h-11 items-center gap-3 overflow-hidden rounded-md px-3 text-sm text-muted transition-colors hover:bg-surface-raised/75 hover:text-foreground",
                selected && "text-foreground",
              )}
            >
              {selected ? (
                <>
                  <motion.span
                    layoutId="sidebar-active-surface"
                    className="absolute inset-0 border border-primary/20 bg-gradient-to-r from-primary/10 to-transparent"
                    transition={{ type: "spring", stiffness: 360, damping: 32 }}
                  />
                  <motion.span
                    layoutId="sidebar-active-rail"
                    className="absolute inset-y-2 left-0 w-0.5 bg-primary shadow-[0_0_14px_var(--primary)]"
                    transition={{ type: "spring", stiffness: 360, damping: 32 }}
                  />
                </>
              ) : null}
              <Icon aria-hidden="true" className="relative size-[18px] stroke-[1.65]" />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-2 flex items-center justify-between border-y border-border px-3 py-2 text-[10px] text-muted">
        <span className="flex items-center gap-1.5"><Activity className="size-3 text-success" />系统在线</span>
        <span>RLS 已启用</span>
      </div>

      <div className="m-3 mt-1">
        <Link
          href="/settings"
          className="flex w-full items-center gap-3 border border-border bg-surface/60 p-3 text-left transition-colors hover:border-line-strong hover:bg-surface-raised"
        >
          <span className="flex size-9 items-center justify-center bg-accent-soft text-sm font-semibold text-accent">
            {workspace.data?.displayName.slice(0, 1) || "我"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{workspace.data?.spaceName || "个人空间"}</span>
            <span className="block truncate text-xs text-muted">{workspace.data?.displayName || "加载中…"}</span>
          </span>
          <ChevronRight className="size-4 text-subtle" />
        </Link>
      </div>
    </aside>
  );
}
