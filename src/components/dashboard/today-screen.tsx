"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { Bot, Check, ChevronRight, Circle, Droplets, Eye, EyeOff, MoonStar, Pencil, Plus, Sparkles, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { todayTasks } from "@/data/demo";
import { formatCurrency } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import type { DemoTask } from "@/types/dashboard";
import { SignalMeter } from "./signal-meter";

const CashFlowChart = dynamic(() => import("./cash-flow-chart"), {
  ssr: false,
  loading: () => <div className="h-full animate-pulse bg-surface-sunken" aria-label="图表加载中" />,
});

const categoryTone: Record<DemoTask["category"], string> = {
  工作: "text-accent border-accent/30 bg-accent-soft",
  健康: "text-success border-success/30 bg-success/10",
  成长: "text-primary border-primary/30 bg-primary/10",
  生活: "text-muted border-border bg-surface-raised",
  复盘: "text-accent border-accent/30 bg-accent-soft",
};

export function TodayScreen({ demo = false }: { demo?: boolean }) {
  const [tasks, setTasks] = useState(todayTasks);
  const [water, setWater] = useState(1500);
  const amountsHidden = useUiStore((state) => state.amountsHidden);
  const toggleAmounts = useUiStore((state) => state.toggleAmounts);
  const setQuickCreateOpen = useUiStore((state) => state.setQuickCreateOpen);
  const completed = tasks.filter((task) => task.status === "done").length;
  const orderedTasks = useMemo(() => [...tasks].sort((a, b) => Number(a.status === "done") - Number(b.status === "done")), [tasks]);

  const toggleTask = (id: string) => {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, status: task.status === "done" ? "todo" : "done" } : task));
  };

  return (
    <div className="mx-auto w-full max-w-[1540px] px-4 py-7 sm:px-6 lg:px-8 lg:py-8">
      {demo ? (
        <div className="mb-5 flex items-center justify-between border-l-2 border-accent bg-accent-soft/50 px-4 py-3 text-sm">
          <span>这是独立生成的演示数据，不会写入 Supabase。</span>
          <a href="/login" className="shrink-0 whitespace-nowrap font-medium text-accent hover:underline">进入登录</a>
        </div>
      ) : null}

      <section className="grid border-b border-line-strong pb-7 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12">
        <div>
          <p className="text-xs tracking-[0.16em] text-muted">2026年8月2日 · 星期日</p>
          <h1 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">早上好，岱旋</h1>
          <p className="mt-2 text-sm text-muted">先完成关键动作，再处理进入系统的杂音。</p>
        </div>
        <div className="mt-7 border-l-2 border-accent pl-5 lg:mt-0">
          <div className="flex items-center gap-2 text-xs font-medium text-accent"><Sparkles aria-hidden="true" className="size-4" />今天最重要的一件事</div>
          <div className="mt-3 flex items-start gap-3">
            <button aria-label="完成最重要的任务" className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-sm border border-line-strong hover:border-primary" type="button"><Circle className="size-3" /></button>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-medium">完成产品需求评审</p>
              <p className="mt-1 text-sm text-muted">聚焦 90 分钟，输出下一阶段清晰边界。</p>
            </div>
            <Button variant="ghost" size="icon" aria-label="编辑最重要的任务"><Pencil /></Button>
          </div>
        </div>
      </section>

      <div className="mt-7 grid gap-7 xl:grid-cols-[1.08fr_0.92fr] xl:gap-8">
        <section aria-labelledby="timeline-title" className="min-w-0">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-baseline gap-3">
              <h2 id="timeline-title" className="text-lg font-semibold">今日时间轴</h2>
              <span className="text-xs text-muted">{completed}/{tasks.length} 已完成</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setQuickCreateOpen(true)}><Plus data-icon="inline-start" />添加事项</Button>
          </div>

          <motion.ol layout className="relative mt-2">
            <span aria-hidden="true" className="absolute bottom-6 left-[75px] top-6 w-px bg-line-strong sm:left-[92px]" />
            <AnimatePresence initial={false}>
              {orderedTasks.map((task) => (
                <motion.li layout key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="group grid grid-cols-[58px_34px_minmax(0,1fr)] items-start py-3 sm:grid-cols-[76px_34px_minmax(0,1fr)]">
                  <div className="pt-0.5 text-right text-xs text-muted numeric">
                    <span className={task.status === "active" ? "font-semibold text-accent" : ""}>{task.time}</span>
                    <span className="mt-0.5 block text-[10px] text-subtle">{task.endTime}</span>
                  </div>
                  <button aria-label={task.status === "done" ? `撤销完成：${task.title}` : `完成：${task.title}`} onClick={() => toggleTask(task.id)} className="relative z-10 mx-auto flex size-6 items-center justify-center rounded-full border border-line-strong bg-background text-success transition-colors hover:border-primary" type="button">
                    {task.status === "done" ? <Check aria-hidden="true" className="size-3.5" /> : task.status === "active" ? <span className="size-2 rounded-full bg-accent" /> : <span className="size-1.5 rounded-full bg-subtle" />}
                  </button>
                  <div className="min-w-0 border-b border-border pb-3 pl-2 sm:flex sm:items-start sm:justify-between sm:gap-3">
                    <div className="min-w-0">
                      <p className={task.status === "done" ? "truncate text-sm text-muted line-through" : "truncate text-sm font-medium"}>{task.title}</p>
                      <p className="mt-1 truncate text-xs text-muted">{task.detail}</p>
                    </div>
                    <Badge className={`mt-2 sm:mt-0 ${categoryTone[task.category]}`}>{task.category}</Badge>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ol>
        </section>

        <aside className="flex min-w-0 flex-col gap-3">
          <section className="border border-border bg-surface">
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <div><h2 className="font-semibold">财务信号</h2><p className="text-xs text-muted">2026 年 8 月</p></div>
              <Button variant="ghost" size="icon" aria-label={amountsHidden ? "显示金额" : "隐藏金额"} onClick={toggleAmounts}>{amountsHidden ? <EyeOff /> : <Eye />}</Button>
            </header>
            <div className="grid grid-cols-3 divide-x divide-border px-2 py-4">
              <Metric label="月收入" value={formatCurrency(28600, amountsHidden)} tone="success" />
              <Metric label="月支出" value={formatCurrency(12850, amountsHidden)} tone="accent" />
              <Metric label="剩余预算" value={formatCurrency(15750, amountsHidden)} />
            </div>
            <div className="signal-grid h-36 border-t border-border px-3 pt-2"><CashFlowChart /></div>
          </section>

          <section className="border border-border bg-surface">
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <div><h2 className="font-semibold">身体信号</h2><p className="text-xs text-muted">今天 · 状态稳定</p></div>
              <ChevronRight aria-hidden="true" className="size-4 text-subtle" />
            </header>
            <div className="grid grid-cols-2 gap-5 px-5 py-5 sm:grid-cols-4">
              <HealthStat icon={MoonStar} label="睡眠" value="7h 24m" detail="质量良好" />
              <HealthStat icon={Droplets} label="饮水" value={`${(water / 1000).toFixed(2)}L`} detail="目标 2.5L" />
              <SignalMeter value={72} label="精力稳定" />
              <SignalMeter value={84} label="心情平和" tone="accent" />
            </div>
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <p className="text-xs text-muted">本周运动 4/5 次 · 压力 3/10</p>
              <Button variant="outline" size="sm" onClick={() => setWater((value) => Math.min(3000, value + 250))}><Droplets data-icon="inline-start" />+250ml</Button>
            </div>
          </section>

          <section className="flex items-center gap-4 border border-border bg-surface px-5 py-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-dashed border-line-strong text-muted"><Bot aria-hidden="true" /></div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold">AI 服务尚未配置</h2>
              <p className="mt-1 text-xs text-muted">未来接入 DeepSeek；任何写操作都先生成确认卡。</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setQuickCreateOpen(true)}>试用确认流程</Button>
          </section>
        </aside>
      </div>

      <footer className="mt-7 grid gap-4 border-t border-line-strong pt-5 text-xs text-muted sm:grid-cols-3">
        <span className="flex items-center gap-2"><Zap aria-hidden="true" className="size-4 text-accent" />今日专注 1h 12m</span>
        <span>今日剩余可安排 6h 38m</span>
        <span>累计完成 {completed}/{tasks.length}</span>
      </footer>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "success" | "accent" }) {
  return <div className="px-3"><p className="text-[11px] text-muted">{label}</p><p className={`mt-1 truncate text-lg font-medium numeric ${tone === "success" ? "text-success" : tone === "accent" ? "text-accent" : ""}`}>{value}</p></div>;
}

function HealthStat({ icon: Icon, label, value, detail }: { icon: typeof MoonStar; label: string; value: string; detail: string }) {
  return <div><div className="flex items-center gap-2 text-xs text-muted"><Icon aria-hidden="true" className="size-4" />{label}</div><p className="mt-2 text-lg font-medium numeric">{value}</p><p className="mt-1 text-[11px] text-success">{detail}</p></div>;
}
