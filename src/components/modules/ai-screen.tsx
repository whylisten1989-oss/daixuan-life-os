"use client";

import { Bot, CheckCircle2, Clock3, LockKeyhole, Settings2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "./module-header";

export function AiScreen() {
  return <div className="app-page"><ModuleHeader icon={Bot} title="AI 助手" description="先理解，再确认；没有授权就不执行。" />
    <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_320px]">
      <section className="flex min-h-[480px] flex-col border border-border bg-surface"><header className="flex items-center gap-3 border-b border-border px-5 py-4"><span className="surface-icon"><LockKeyhole /></span><div><h2 className="text-sm font-semibold">AI 服务尚未配置</h2><p className="text-xs text-muted">当前不会解析输入、生成回复或执行操作</p></div></header><div className="flex flex-1 flex-col items-center justify-center px-6 text-center"><Bot className="size-9 text-subtle" /><h3 className="mt-4 text-lg font-medium">连接服务后再启用对话</h3><p className="mt-2 max-w-md text-sm leading-6 text-muted">后续接入 DeepSeek 时，每项写操作都先形成可检查的确认卡；删除、批量修改和外部发送不会自动执行。</p><Button asChild className="mt-6" variant="outline"><Link href="/settings"><Settings2 data-icon="inline-start" />前往设置</Link></Button></div><div className="border-t border-border p-4"><textarea disabled aria-label="AI 输入未启用" placeholder="AI 服务尚未配置" className="min-h-12 w-full resize-none bg-transparent px-2 py-3 text-sm text-muted outline-none" /></div></section>
      <aside className="space-y-6"><section><h2 className="text-sm font-semibold">安全边界</h2><ul className="mt-3 space-y-3 text-xs leading-5 text-muted"><li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />任何写操作必须人工确认</li><li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />删除与批量修改显示影响范围</li><li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />外部消息默认禁止</li></ul></section><section className="border-t border-border pt-5"><div className="flex items-center gap-2"><Clock3 className="size-4 text-muted" /><h2 className="text-sm font-semibold">最近操作</h2></div><p className="mt-3 text-xs text-muted">AI 未连接，暂无操作记录。</p></section></aside>
    </div>
  </div>;
}
