"use client";

import { BookOpen, Check, CircleDollarSign, Droplets, ListChecks } from "lucide-react";
import { useState } from "react";
import { FormField, FormStatus, Select, Textarea } from "@/components/forms/form-controls";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useFinance, useFinanceActions } from "@/hooks/use-finance";
import { useHealthActions } from "@/hooks/use-health";
import { useTaskActions } from "@/hooks/use-tasks";
import { useWorkspace } from "@/hooks/use-workspace";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

const types = [{ id: "task", label: "任务", icon: ListChecks }, { id: "expense", label: "支出", icon: CircleDollarSign }, { id: "income", label: "收入", icon: CircleDollarSign }, { id: "water", label: "饮水", icon: Droplets }, { id: "note", label: "笔记", icon: BookOpen }] as const;
type QuickType = (typeof types)[number]["id"];

export function QuickCreateDialog() {
  const open = useUiStore((state) => state.quickCreateOpen); const setOpen = useUiStore((state) => state.setQuickCreateOpen);
  const workspace = useWorkspace(); const finance = useFinance(workspace.data?.spaceId); const taskActions = useTaskActions(workspace.data?.spaceId); const financeActions = useFinanceActions(workspace.data?.spaceId); const healthActions = useHealthActions(workspace.data?.spaceId);
  const [selected, setSelected] = useState<QuickType>("task"); const [status, setStatus] = useState(""); const [error, setError] = useState("");
  const close = () => { setOpen(false); setStatus(""); setError(""); setSelected("task"); };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const title = String(form.get("title") ?? "").trim(); setError(""); setStatus("");
    try {
      if (!workspace.data) throw new Error("个人空间仍在加载");
      if (selected === "task") await taskActions.save.mutateAsync({ values: { title, status: "INBOX", area: String(form.get("area")) as "WORK" | "LIFE" } });
      if (selected === "expense" || selected === "income") await financeActions.insert.mutateAsync({ table: "transactions", values: { account_id: String(form.get("accountId")), type: selected === "expense" ? "EXPENSE" : "INCOME", amount: Number(form.get("amount")), occurred_at: new Date().toISOString(), merchant: title || null } });
      if (selected === "water") await healthActions.save.mutateAsync({ table: "water_logs", values: { amount_ml: Number(form.get("amount")), recorded_at: new Date().toISOString() } });
      if (selected === "note") { const { error: noteError } = await createClient().from("knowledge_notes").insert({ space_id: workspace.data.spaceId, title, content: String(form.get("content") ?? "") || null }); if (noteError) throw noteError; }
      event.currentTarget.reset(); setStatus("已保存到当前个人空间"); setTimeout(close, 700);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "保存失败"); }
  };
  const busy = taskActions.save.isPending || financeActions.insert.isPending || healthActions.save.isPending;
  return <Dialog open={open} onOpenChange={(next) => next ? setOpen(true) : close()}><DialogContent><DialogHeader><DialogTitle>快速创建</DialogTitle><DialogDescription>选择记录类型后直接写入对应模块，不调用 AI。</DialogDescription></DialogHeader><form onSubmit={submit}><div className="space-y-5 px-5 py-5 sm:px-6"><div className="flex gap-2 overflow-x-auto scrollbar-none">{types.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => { setSelected(item.id); setError(""); }} className={cn("flex min-h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-sm text-muted", selected === item.id && "border-primary bg-surface-raised text-foreground")}><Icon className="size-4" />{item.label}</button>; })}</div><QuickFields selected={selected} accounts={finance.data?.accounts ?? []} /><FormStatus>{status ? <span className="flex items-center gap-2"><Check className="size-4" />{status}</span> : null}</FormStatus><FormStatus danger>{error}</FormStatus></div><DialogFooter><Button type="button" variant="outline" onClick={close}>取消</Button><Button type="submit" disabled={busy}>{busy ? "保存中…" : "立即保存"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

function QuickFields({ selected, accounts }: { selected: QuickType; accounts: { id: string; name: string }[] }) {
  if (selected === "task") return <><FormField label="任务标题"><Input name="title" autoFocus required placeholder="下一步要完成什么" /></FormField><FormField label="领域"><Select name="area"><option value="WORK">工作</option><option value="LIFE">生活</option></Select></FormField></>;
  if (selected === "expense" || selected === "income") return <><FormField label={selected === "expense" ? "用途" : "来源"}><Input name="title" autoFocus placeholder={selected === "expense" ? "例如：午餐" : "例如：工资"} /></FormField><div className="grid gap-4 sm:grid-cols-2"><FormField label="账户"><Select name="accountId" required><option value="">请选择</option>{accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></FormField><FormField label="金额"><Input name="amount" type="number" min="0.01" step="0.01" required /></FormField></div>{!accounts.length ? <p className="text-xs text-accent">请先到财务中心创建账户。</p> : null}</>;
  if (selected === "water") return <FormField label="饮水量（ml）"><Input name="amount" autoFocus type="number" min="50" step="50" defaultValue="250" required /></FormField>;
  return <><FormField label="笔记标题"><Input name="title" autoFocus required /></FormField><FormField label="内容"><Textarea name="content" /></FormField></>;
}
