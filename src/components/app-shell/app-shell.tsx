"use client";

import { useEffect, type ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QuickCreateDialog } from "@/components/quick-create/quick-create-dialog";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useUiStore } from "@/store/ui-store";

export function AppShell({ children }: { children: ReactNode }) {
  const setQuickCreateOpen = useUiStore((state) => state.setQuickCreateOpen);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setQuickCreateOpen(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [setQuickCreateOpen]);

  return (
    <TooltipProvider delayDuration={400}>
      <Sidebar />
      <Topbar />
      <main className="min-h-[calc(100vh-4rem)] pb-24 lg:ml-[208px] lg:pb-0">{children}</main>
      <MobileNav />
      <QuickCreateDialog />
    </TooltipProvider>
  );
}
