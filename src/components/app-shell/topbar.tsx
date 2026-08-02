"use client";

import { Plus, Search, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/store/ui-store";
import { navItems } from "./nav-items";
import { ThemeToggle } from "./theme-toggle";

export function Topbar() {
  const pathname = usePathname();
  const setQuickCreateOpen = useUiStore((state) => state.setQuickCreateOpen);
  const current = navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  return (
    <header className="sticky top-0 z-20 flex h-[68px] items-center gap-3 border-b border-border bg-background/88 px-4 backdrop-blur-2xl sm:px-6 lg:ml-[220px] lg:px-5">
      <div className="min-w-0 flex-1 lg:hidden">
        <p className="truncate text-sm font-semibold">{current?.label ?? "岱旋 Life OS"}</p>
        <p className="text-[10px] text-subtle">个人空间</p>
      </div>

      <div className="hidden min-w-0 flex-1 items-center gap-4 lg:flex">
        <div className="w-32">
          <p className="text-[10px] uppercase tracking-[0.2em] text-subtle">Current view</p>
          <p className="mt-0.5 text-sm font-medium">{current?.label ?? "岱旋 Life OS"}</p>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.992 }}
          onClick={() => setQuickCreateOpen(true)}
          className="group flex h-10 w-full max-w-xl items-center gap-2 border border-border bg-surface/60 px-3 text-left text-sm text-muted transition-colors hover:border-line-strong hover:bg-surface-raised"
        >
          <Search className="size-4" />
          <span className="min-w-0 flex-1 truncate">快速记录任务、支出、饮水或笔记…</span>
          <span className="flex items-center gap-1 text-[10px] text-subtle"><Sparkles className="size-3" />智能入口</span>
        </motion.button>
      </div>

      <ThemeToggle />
      <SignOutButton />
      <Button className="hidden sm:inline-flex" onClick={() => setQuickCreateOpen(true)}>
        <Plus data-icon="inline-start" />快速创建
      </Button>
    </header>
  );
}
