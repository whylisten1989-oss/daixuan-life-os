"use client";

import { Plus, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "./theme-toggle";
import { useUiStore } from "@/store/ui-store";
import { navItems } from "./nav-items";

export function Topbar({ demo = false }: { demo?: boolean }) {
  const pathname = usePathname();
  const setQuickCreateOpen = useUiStore((state) => state.setQuickCreateOpen);
  const current = navItems.find((item) => pathname === (demo ? item.demoHref : item.href));

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/88 px-4 backdrop-blur-xl sm:px-6 lg:ml-[208px] lg:px-8">
      <div className="min-w-0 flex-1 lg:hidden">
        <p className="truncate text-sm font-semibold">{current?.label ?? "岱旋 Life OS"}</p>
        <p className="text-[10px] text-subtle">个人空间</p>
      </div>
      <div className="hidden min-w-0 flex-1 items-center lg:flex">
        <label className="flex h-10 w-full max-w-xl items-center gap-2 border-b border-border text-sm text-muted focus-within:border-primary">
          <Search aria-hidden="true" className="size-4" />
          <input aria-label="全局搜索" className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-subtle" placeholder="搜索任务、记录、知识…" />
          <kbd className="rounded-sm border border-border px-1.5 py-0.5 text-[10px] text-subtle">⌘ K</kbd>
        </label>
      </div>
      {demo ? <span className="hidden rounded-sm border border-accent/40 bg-accent-soft px-2 py-1 text-[11px] text-accent sm:inline">演示数据</span> : null}
      <ThemeToggle />
      {!demo ? <SignOutButton /> : null}
      <Button className="hidden sm:inline-flex" onClick={() => setQuickCreateOpen(true)}>
        <Plus data-icon="inline-start" />
        快速创建
      </Button>
    </header>
  );
}
