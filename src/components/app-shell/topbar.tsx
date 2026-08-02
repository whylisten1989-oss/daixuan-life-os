"use client";

import { ChevronDown, Plus, Search, Sparkles } from "lucide-react";
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
    <header className="sticky top-0 z-20 flex h-[64px] items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-2xl sm:px-5 lg:ml-[190px]">
      <div className="min-w-0 flex-1 lg:hidden">
        <p className="truncate text-sm font-semibold">{current?.label ?? "岱旋 Life OS"}</p>
        <p className="text-[10px] text-subtle">个人空间</p>
      </div>

      <div className="hidden min-w-0 flex-1 items-center gap-4 lg:flex">
        <Button
          variant="outline"
          className="h-9 shrink-0 rounded-none border-line-strong bg-surface/55"
          onClick={() => setQuickCreateOpen(true)}
        >
          <Plus data-icon="inline-start" />
          快速创建
          <ChevronDown className="ml-1 size-3.5 text-muted" />
        </Button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.995 }}
          onClick={() => setQuickCreateOpen(true)}
          className="group flex h-9 w-full max-w-[420px] items-center gap-2 border border-border bg-surface/45 px-3 text-left text-xs text-muted transition-colors hover:border-line-strong hover:bg-surface-raised"
        >
          <Search className="size-4" />
          <span className="min-w-0 flex-1 truncate">搜索任务、笔记、知识、人物…</span>
          <span className="flex items-center gap-1 text-[9px] text-subtle"><Sparkles className="size-3" />智能入口</span>
        </motion.button>
      </div>

      <ThemeToggle />
      <SignOutButton />
    </header>
  );
}
