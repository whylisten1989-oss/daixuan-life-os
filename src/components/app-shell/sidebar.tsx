"use client";

import { ChevronRight, Mountain } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@/hooks/use-workspace";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

export function Sidebar() {
  const pathname = usePathname();
  const workspace = useWorkspace();
  return <aside className="fixed inset-y-0 left-0 z-30 hidden w-[208px] flex-col border-r border-border bg-sidebar lg:flex">
    <div className="flex h-20 items-center gap-3 px-5"><div className="flex size-9 items-center justify-center rounded-md border border-line-strong bg-surface text-primary"><Mountain aria-hidden="true" /></div><div><p className="font-semibold tracking-[0.08em]">岱旋 Life OS</p><p className="text-[10px] uppercase tracking-[0.22em] text-subtle">Daixuan</p></div></div>
    <nav aria-label="主导航" className="flex flex-1 flex-col gap-1 px-3 py-4">{navItems.map((item) => { const selected = pathname === item.href || pathname.startsWith(`${item.href}/`); const Icon = item.icon; return <Link key={item.href} href={item.href} aria-current={selected ? "page" : undefined} className={cn("group relative flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-muted transition-colors hover:bg-surface-raised hover:text-foreground", selected && "bg-surface-raised text-foreground")}>{selected ? <span className="absolute inset-y-2 -left-3 w-0.5 bg-primary" /> : null}<Icon aria-hidden="true" className="size-[18px] stroke-[1.7]" /><span>{item.label}</span></Link>; })}</nav>
    <div className="m-3 border-t border-border pt-4"><Link href="/settings" className="flex w-full items-center gap-3 rounded-md p-3 text-left hover:bg-surface-raised"><span className="flex size-9 items-center justify-center rounded-md bg-accent-soft text-sm font-semibold text-accent">{workspace.data?.displayName.slice(0, 1) || "我"}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{workspace.data?.spaceName || "个人空间"}</span><span className="block truncate text-xs text-muted">{workspace.data?.displayName || "加载中…"}</span></span><ChevronRight className="size-4 text-subtle" /></Link></div>
  </aside>;
}
