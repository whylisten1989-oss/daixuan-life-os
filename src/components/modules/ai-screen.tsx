"use client";

import { Bot, CheckCircle2, Clock3, Send, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "./module-header";

export function AiScreen() {
  const [input, setInput] = useState("");
  const [showDraft, setShowDraft] = useState(false);
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 lg:px-8">
      <ModuleHeader icon={Bot} title="AI 助手" description="先理解，再确认；没有授权就不执行。" />
      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_300px]">
        <section className="min-h-[560px] border border-border bg-surface">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4"><span className="flex size-9 items-center justify-center rounded-full border border-dashed border-line-strong text-muted"><Sparkles className="size-4" /></span><div><h2 className="text-sm font-semibold">AI 服务尚未配置</h2><p className="text-xs text-muted">计划接入 DeepSeek</p></div></div>
          <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center"><Bot className="size-10 text-subtle" /><h3 className="mt-4 text-lg font-medium">当前只演示安全确认流程</h3><p className="mt-2 max-w-md text-sm leading-6 text-muted">你可以输入一条自然语言记录，系统会在本地生成结构化确认卡，不会请求模型，也不会写入数据库。</p><div className="mt-5 flex flex-wrap justify-center gap-2">{["创建明天的任务", "记录午饭支出 32 元", "刚喝了 500ml 水"].map((example) => <button key={example} type="button" onClick={() => setInput(example)} className="rounded-md border border-border px-3 py-2 text-xs text-muted hover:border-line-strong hover:text-foreground">{example}</button>)}</div></div>
          <div className="border-t border-border p-4"><div className="flex items-end gap-3"><textarea aria-label="AI 快速输入" value={input} onChange={(event) => { setInput(event.target.value); setShowDraft(false); }} placeholder="输入想记录或执行的内容…" className="min-h-12 flex-1 resize-none bg-transparent px-2 py-3 text-sm outline-none placeholder:text-subtle" /><Button size="icon" disabled={!input.trim()} aria-label="生成确认卡" onClick={() => setShowDraft(true)}><Send /></Button></div></div>
        </section>
        <aside className="flex flex-col gap-5">
          {showDraft ? <section className="border-l-2 border-accent bg-accent-soft/55 p-4"><div className="flex items-center gap-2 text-xs font-semibold text-accent"><ShieldCheck className="size-4" />操作确认卡</div><dl className="mt-4 flex flex-col gap-3 text-sm"><div><dt className="text-xs text-muted">原始输入</dt><dd className="mt-1">{input}</dd></div><div><dt className="text-xs text-muted">建议动作</dt><dd className="mt-1">仅创建一条草稿记录</dd></div><div><dt className="text-xs text-muted">风险等级</dt><dd className="mt-1">低 · 不涉及删除或外部发送</dd></div></dl><div className="mt-5 flex gap-2"><Button size="sm">确认</Button><Button variant="outline" size="sm" onClick={() => setShowDraft(false)}>取消</Button></div></section> : null}
          <section><h2 className="text-sm font-semibold">安全边界</h2><ul className="mt-3 flex flex-col gap-3 text-xs leading-5 text-muted"><li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />任何写操作必须人工确认</li><li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />删除与批量修改显示影响范围</li><li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />外部消息默认禁止</li></ul></section>
          <section className="border-t border-border pt-5"><div className="flex items-center gap-2"><Clock3 className="size-4 text-muted" /><h2 className="text-sm font-semibold">最近操作</h2></div><p className="mt-3 text-xs text-muted">暂无已执行的 AI 操作。</p></section>
        </aside>
      </div>
    </div>
  );
}
