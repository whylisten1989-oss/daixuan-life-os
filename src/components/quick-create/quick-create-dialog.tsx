"use client";

import { AnimatePresence, motion } from "motion/react";
import { BookOpen, Check, CircleDollarSign, Droplets, ListChecks, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUiStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

const commandSchema = z.string().trim().min(2, "请至少输入两个字").max(240, "内容过长");
const types = [
  { id: "task", label: "任务", icon: ListChecks },
  { id: "expense", label: "收支", icon: CircleDollarSign },
  { id: "water", label: "饮水", icon: Droplets },
  { id: "note", label: "笔记", icon: BookOpen },
] as const;

function inferPreview(input: string, selected: (typeof types)[number]["id"]) {
  if (selected === "water") return { type: "健康记录 · 饮水", content: input, pending: "记录时间" };
  if (selected === "expense") return { type: "财务记录 · 待分类", content: input, pending: "账户、分类" };
  if (selected === "note") return { type: "知识记录 · 快速笔记", content: input, pending: "标签" };
  return { type: "任务 · Inbox", content: input, pending: "截止日期、优先级" };
}

export function QuickCreateDialog({ demo = false }: { demo?: boolean }) {
  const open = useUiStore((state) => state.quickCreateOpen);
  const setOpen = useUiStore((state) => state.setQuickCreateOpen);
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<(typeof types)[number]["id"]>("task");
  const [previewing, setPreviewing] = useState(false);
  const [saved, setSaved] = useState(false);
  const validation = useMemo(() => commandSchema.safeParse(input), [input]);
  const preview = inferPreview(input, selected);

  const reset = () => {
    setInput("");
    setPreviewing(false);
    setSaved(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) reset(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>快速创建</DialogTitle>
          <DialogDescription>先识别和确认，再写入对应模块。当前不会调用 AI。</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="flex gap-2 overflow-x-auto scrollbar-none" role="list" aria-label="记录类型">
            {types.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} type="button" onClick={() => setSelected(item.id)} className={cn("flex min-h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-sm text-muted", selected === item.id && "border-primary bg-surface-raised text-foreground")}>
                  <Icon aria-hidden="true" className="size-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
          <textarea
            autoFocus
            aria-label="快速创建内容"
            className="min-h-28 resize-none border-0 border-b border-line-strong bg-transparent py-3 text-lg outline-none placeholder:text-subtle"
            placeholder="例如：明天下午完成季度复盘"
            value={input}
            onChange={(event) => { setInput(event.target.value); setPreviewing(false); setSaved(false); }}
          />
          {!validation.success && input ? <p className="text-xs text-danger">{validation.error.issues[0]?.message}</p> : null}

          <AnimatePresence mode="wait">
            {previewing ? (
              <motion.section key="preview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="border-l-2 border-accent bg-accent-soft/55 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-accent">
                  <Sparkles aria-hidden="true" className="size-4" />
                  操作确认卡
                </div>
                <dl className="mt-3 grid grid-cols-[88px_1fr] gap-y-2 text-sm">
                  <dt className="text-muted">识别类型</dt><dd>{preview.type}</dd>
                  <dt className="text-muted">提取内容</dt><dd>{preview.content}</dd>
                  <dt className="text-muted">待确认</dt><dd>{preview.pending}</dd>
                </dl>
                <p className="mt-3 text-xs text-muted">{demo ? "演示模式：确认后仅更新本地界面。" : "确认后写入当前个人空间。"}</p>
              </motion.section>
            ) : null}
          </AnimatePresence>
        </div>
        <DialogFooter>
          {saved ? <span className="mr-auto flex items-center gap-2 text-sm text-success"><Check aria-hidden="true" className="size-4" />已记录到演示列表</span> : null}
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          {previewing ? (
            <Button disabled={saved} onClick={() => setSaved(true)}>确认创建</Button>
          ) : (
            <Button disabled={!validation.success} onClick={() => setPreviewing(true)}>生成确认卡</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
