"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Bot, CalendarClock, Check, ChevronRight, Circle, Clock3, Droplets, Eye, EyeOff, HeartPulse, Pencil, Plus, Settings2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { TaskEditorDialog } from "@/components/task/task-editor-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFinance } from "@/hooks/use-finance";
import { useHealth, useHealthActions } from "@/hooks/use-health";
import { useProjects, useTaskActions, useTasks } from "@/hooks/use-tasks";
import { useWorkspace } from "@/hooks/use-workspace";
import { addToDate, formatCurrentDate, formatDateTime, isToday, localDateKey } from "@/lib/date";
import { formatCurrency } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import type { FinanceData, HealthData, TaskRecord } from "@/types/life";

const TaskTrend = dynamic(() => import("./task-trend"), { ssr: false, loading: () => <div className="h-32 animate-pulse bg-surface-raised" /> });
const emptyFinance: FinanceData = { accounts: [], categories: [], transactions: [], budgets: [], recurringExpenses: [], subscriptions: [], creditCards: [], loans: [], savingsGoals: [], purchasePlans: [], salarySetting: null, debtPayments: [] };
const emptyHealth: HealthData = { sleepLogs: [], waterLogs: [], workoutLogs: [], dailyCheckins: [], goals: [] };

export function TodayScreen() {
  const workspace = useWorkspace();
  const tasksQuery = useTasks(workspace.data?.spaceId);
  const projectsQuery = useProjects(workspace.data?.spaceId);
  const financeQuery = useFinance(workspace.data?.spaceId);
  const healthQuery = useHealth(workspace.data?.spaceId);
  const taskActions = useTaskActions(workspace.data?.spaceId);
  const healthActions = useHealthActions(workspace.data?.spaceId);
  const hidden = useUiStore((state) => state.amountsHidden);
  const toggleAmounts = useUiStore((state) => state.toggleAmounts);
  const setQuickCreateOpen = useUiStore((state) => state.setQuickCreateOpen);
  const [selected, setSelected] = useState<TaskRecord | null>(null);
  const [referenceNow] = useState(() => Date.now());
  const tasks = tasksQuery.data ?? [];
  const projects = projectsQuery.data ?? [];
  const finance = financeQuery.data ?? emptyFinance;
  const health = healthQuery.data ?? emptyHealth;
  const todayTasks = tasks.filter((task) => task.status !== "CANCELLED" && (isToday(task.due_at) || isToday(task.scheduled_at)));
  const timeline = todayTasks.filter((task) => task.scheduled_at).sort((a, b) => String(a.scheduled_at).localeCompare(String(b.scheduled_at)));
  const unscheduled = todayTasks.filter((task) => !task.scheduled_at && !task.parent_id);
  const followups = tasks.filter((task) => task.status === "WAITING" || (task.next_follow_up_at && new Date(task.next_follow_up_at) <= new Date())).slice(0, 4);
  const completed = todayTasks.filter((task) => task.status === "COMPLETED").length;
  const important = [...todayTasks].filter((task) => task.status !== "COMPLETED").sort((a, b) => priorityScore(b) - priorityScore(a) || String(a.due_at).localeCompare(String(b.due_at)))[0];
  const estimate = todayTasks.reduce((sum, task) => sum + (task.estimate_minutes ?? 0), 0);
  const actual = todayTasks.reduce((sum, task) => sum + (task.actual_minutes ?? 0), 0);
  const month = localDateKey().slice(0, 7);
  const monthTransactions = finance.transactions.filter((item) => item.occurred_at.startsWith(month));
  const income = monthTransactions.filter((item) => item.type === "INCOME").reduce((sum, item) => sum + Number(item.amount), 0);
  const expense = monthTransactions.filter((item) => item.type === "EXPENSE").reduce((sum, item) => sum + Number(item.amount), 0);
  const budgets = finance.budgets.filter((item) => String(item.month).startsWith(month)).reduce((sum, item) => sum + Number(item.amount), 0);
  const water = health.waterLogs.filter((item) => localDateKey(new Date(item.recorded_at)) === localDateKey()).reduce((sum, item) => sum + item.amount_ml, 0);
  const latestSleep = health.sleepLogs[0];
  const latestCheckin = health.dailyCheckins.find((item) => item.date === localDateKey()) ?? health.dailyCheckins[0];
  const bills = [...finance.recurringExpenses, ...finance.subscriptions, ...finance.loans].sort((a, b) => String(a.next_due_at ?? a.next_payment_at).localeCompare(String(b.next_due_at ?? b.next_payment_at))).slice(0, 3);
  const weeklyWorkoutCount = health.workoutLogs.filter((item) => referenceNow - new Date(item.started_at).getTime() < 7 * 86400000).length;

  if (workspace.isLoading || tasksQuery.isLoading) return <div className="app-page"><div className="h-72 animate-pulse bg-surface-raised" /></div>;

  return <div className="app-page today-layout">
    <section className="today-hero">
      <div><p className="today-date">{formatCurrentDate()}</p><h1>{greeting()}，{workspace.data?.displayName}</h1><p>先推进最重要的动作，再处理进入系统的其他事项。</p></div>
      <div className="today-priority"><div className="flex items-center gap-2 text-xs font-medium text-accent"><Sparkles className="size-4" />今天最重要的一件事</div>{important ? <button type="button" onClick={() => setSelected(important)} className="mt-3 flex w-full items-start gap-3 text-left"><span className="mt-1 flex size-6 items-center justify-center border border-line-strong"><Circle className="size-3" /></span><span className="min-w-0 flex-1"><strong>{important.title}</strong><small>{important.description || (important.estimate_minutes ? `预计 ${important.estimate_minutes} 分钟` : "点击补充完成标准")}</small></span><Pencil className="size-4 text-muted" /></button> : <button type="button" className="mt-3 text-left text-sm text-muted" onClick={() => setQuickCreateOpen(true)}>今天还没有重点任务，创建一个明确动作。</button>}</div>
    </section>
    <section className="ai-command-line"><Bot className="size-4 text-primary" /><span className="min-w-0 flex-1">AI 服务尚未配置</span><span className="hidden text-xs text-muted sm:inline">配置后可将自然语言转换为待确认操作</span><Button asChild variant="ghost" size="sm"><Link href="/settings"><Settings2 data-icon="inline-start" />设置</Link></Button></section>

    <div className="mt-7 grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(350px,0.85fr)]">
      <main className="min-w-0 space-y-8">
        <section><div className="section-heading"><div><h2>今日时间轴</h2><p>{timeline.length} 项已安排具体时间</p></div><Button variant="ghost" size="sm" onClick={() => setQuickCreateOpen(true)}><Plus data-icon="inline-start" />添加事项</Button></div>{timeline.length ? <motion.ol layout className="timeline-list"><AnimatePresence initial={false}>{timeline.map((task) => <TimelineItem key={task.id} task={task} referenceNow={referenceNow} onOpen={() => setSelected(task)} onComplete={() => task.status === "COMPLETED" ? taskActions.update.mutate({ id: task.id, values: { status: "TODO", completed_at: null } }) : taskActions.complete.mutate(task)} onDelay={() => taskActions.update.mutate({ id: task.id, values: { scheduled_at: addToDate(task.scheduled_at, 1, "day"), due_at: task.due_at ? addToDate(task.due_at, 1, "day") : null } })} />)}</AnimatePresence></motion.ol> : <div className="empty-panel"><CalendarClock className="size-6 text-primary" /><p>今天还没有按时间安排的事项</p></div>}</section>
        <section><div className="section-heading"><div><h2>未安排具体时间</h2><p>今天要完成，但保留时间弹性</p></div><span>{unscheduled.length} 项</span></div><TaskList tasks={unscheduled} onOpen={setSelected} onComplete={(task) => taskActions.complete.mutate(task)} /></section>
        <section><div className="section-heading"><div><h2>待跟进事项</h2><p>等待外部反馈或已到跟进时间</p></div><Link href="/tasks" className="text-xs text-primary">查看全部</Link></div><TaskList tasks={followups} onOpen={setSelected} onComplete={(task) => taskActions.complete.mutate(task)} empty="没有需要跟进的事项" /></section>
        <section className="progress-ledger"><div><span>今日完成进度</span><strong>{todayTasks.length ? Math.round(completed / todayTasks.length * 100) : 0}%</strong><div><i style={{ width: `${todayTasks.length ? completed / todayTasks.length * 100 : 0}%` }} /></div></div><div><span>预计用时</span><strong>{formatMinutes(estimate)}</strong></div><div><span>实际用时</span><strong>{formatMinutes(actual)}</strong></div></section>
      </main>

      <aside className="space-y-5">
        <section className="summary-surface"><header><div><h2>财务摘要</h2><p>{new Date().getMonth() + 1} 月</p></div><Button size="icon" variant="ghost" aria-label={hidden ? "显示金额" : "隐藏金额"} onClick={toggleAmounts}>{hidden ? <EyeOff /> : <Eye />}</Button></header><div className="grid grid-cols-3 gap-3 px-4 py-5"><SummaryValue label="收入" value={formatCurrency(income, hidden)} tone="success" /><SummaryValue label="支出" value={formatCurrency(expense, hidden)} tone="accent" /><SummaryValue label="剩余预算" value={formatCurrency(Math.max(0, budgets - expense), hidden)} /></div><Link href="/finance" className="summary-link">进入财务中心<ArrowRight /></Link></section>
        <section className="summary-surface"><header><div><h2>健康摘要</h2><p>今天</p></div><HeartPulse className="size-4 text-primary" /></header><div className="health-summary-grid"><SummaryValue label="昨晚睡眠" value={latestSleep ? `${((new Date(latestSleep.wake_at).getTime() - new Date(latestSleep.sleep_at).getTime()) / 3600000).toFixed(1)}h` : "—"} /><SummaryValue label="饮水" value={`${(water / 1000).toFixed(2)}L`} /><SummaryValue label="精力" value={latestCheckin ? `${latestCheckin.energy}/5` : "—"} /><SummaryValue label="本周运动" value={`${weeklyWorkoutCount} 次`} /></div><div className="border-t border-border px-4 py-3"><Button size="sm" variant="outline" onClick={() => healthActions.save.mutate({ table: "water_logs", values: { amount_ml: 250, recorded_at: new Date().toISOString() } })}><Droplets data-icon="inline-start" />+250ml</Button></div></section>
        <section className="summary-surface"><header><div><h2>近期账单与还款</h2><p>下一步需要准备的资金</p></div></header>{bills.length ? <ul className="divide-y divide-border px-4">{bills.map((bill) => <li key={String(bill.id)} className="data-row"><span><strong>{String(bill.name ?? "贷款还款")}</strong><small>{String(bill.next_due_at ?? bill.next_payment_at)}</small></span><b>{formatCurrency(Number(bill.amount ?? bill.monthly_payment), hidden)}</b></li>)}</ul> : <div className="px-4 pb-5 text-sm text-muted">没有即将到期的账单</div>}</section>
        <section className="summary-surface"><header><div><h2>本周任务趋势</h2><p>最近七天完成数</p></div><ChevronRight className="size-4 text-muted" /></header><div className="px-3 pb-3"><TaskTrend tasks={tasks} /></div></section>
      </aside>
    </div>
    <TaskEditorDialog key={selected?.id ?? "closed"} open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }} spaceId={workspace.data?.spaceId} projects={projects} task={selected} />
  </div>;
}

function TimelineItem({ task, referenceNow, onOpen, onComplete, onDelay }: { task: TaskRecord; referenceNow: number; onOpen: () => void; onComplete: () => void; onDelay: () => void }) { const active = isCurrent(task, referenceNow); return <motion.li layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`timeline-item ${task.status === "COMPLETED" ? "is-done" : ""} ${active ? "is-current" : ""}`}><time>{task.scheduled_at ? new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(task.scheduled_at)) : "—"}</time><button className="timeline-node" aria-label={task.status === "COMPLETED" ? "恢复任务" : "完成任务"} onClick={onComplete} type="button">{task.status === "COMPLETED" ? <Check /> : <span />}</button><button type="button" onClick={onOpen} className="timeline-content"><strong>{task.title}</strong><small>{task.estimate_minutes ? `预计 ${task.estimate_minutes} 分钟` : task.description || "点击查看详情"}</small></button><div className="timeline-actions"><Button size="sm" variant="ghost" onClick={onDelay}>延期</Button><Button size="icon" variant="ghost" onClick={onOpen} aria-label="调整时间"><Clock3 /></Button></div></motion.li>; }
function TaskList({ tasks, onOpen, onComplete, empty = "今天没有未安排时间的任务" }: { tasks: TaskRecord[]; onOpen: (task: TaskRecord) => void; onComplete: (task: TaskRecord) => void; empty?: string }) { if (!tasks.length) return <div className="py-5 text-sm text-muted">{empty}</div>; return <ul className="divide-y divide-border">{tasks.map((task) => <li key={task.id} className="compact-task"><button className="task-check" onClick={() => onComplete(task)} type="button"><Circle /></button><button className="min-w-0 flex-1 text-left" onClick={() => onOpen(task)} type="button"><strong>{task.title}</strong><small>{task.waiting_for ? `等待：${task.waiting_for}` : task.due_at ? `截止 ${formatDateTime(task.due_at)}` : task.description || "无具体时间"}</small></button><Badge>{task.area === "WORK" ? "工作" : "生活"}</Badge></li>)}</ul>; }
function SummaryValue({ label, value, tone }: { label: string; value: string; tone?: "success" | "accent" }) { return <div><p className="text-[11px] text-muted">{label}</p><p className={`mt-1 truncate font-medium numeric ${tone === "success" ? "text-success" : tone === "accent" ? "text-accent" : ""}`}>{value}</p></div>; }
function greeting() { const hour = new Date().getHours(); return hour < 6 ? "夜深了" : hour < 11 ? "早上好" : hour < 14 ? "中午好" : hour < 18 ? "下午好" : "晚上好"; }
function priorityScore(task: TaskRecord) { return { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 }[task.priority]; }
function formatMinutes(minutes: number) { return `${Math.floor(minutes / 60)}h ${minutes % 60}m`; }
function isCurrent(task: TaskRecord, referenceNow: number) { if (!task.scheduled_at || task.status === "COMPLETED") return false; const start = new Date(task.scheduled_at).getTime(); const end = start + (task.estimate_minutes ?? 60) * 60000; return referenceNow >= start && referenceNow <= end; }
