"use client";

import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Bot,
  CalendarClock,
  Check,
  ChevronRight,
  Circle,
  Clock3,
  Droplets,
  Eye,
  EyeOff,
  Footprints,
  HeartPulse,
  Pencil,
  Plus,
  Settings2,
  Sparkles,
  TimerReset,
  TrendingUp,
  WalletCards,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TaskEditorDialog } from "@/components/task/task-editor-dialog";
import { Button } from "@/components/ui/button";
import { PointerSpotlight } from "@/components/ui/pointer-spotlight";
import { SpringNumber } from "@/components/ui/spring-number";
import { useFinance } from "@/hooks/use-finance";
import { useHealth, useHealthActions } from "@/hooks/use-health";
import { useProjects, useTaskActions, useTasks } from "@/hooks/use-tasks";
import { useWorkspace } from "@/hooks/use-workspace";
import { addToDate, formatCurrentDate, formatDateTime, isToday, localDateKey } from "@/lib/date";
import { formatCurrency } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import type { FinanceData, HealthData, TaskRecord, TransactionRecord } from "@/types/life";
import { CashFlowChart, SleepSignalChart, TaskPulseChart } from "./command-center-charts";
import styles from "./command-center.module.css";

const QUOTES = [
  "知行合一，日拱一卒。",
  "凡事预则立，不预则废。",
  "不积跬步，无以至千里。",
  "静以修身，俭以养德。",
  "欲速则不达，见小利则大事不成。",
  "慎终如始，则无败事。",
  "功不唐捐，玉汝于成。",
];

const emptyFinance: FinanceData = {
  accounts: [],
  categories: [],
  transactions: [],
  budgets: [],
  recurringExpenses: [],
  subscriptions: [],
  creditCards: [],
  loans: [],
  savingsGoals: [],
  purchasePlans: [],
  salarySetting: null,
  debtPayments: [],
};

const emptyHealth: HealthData = {
  sleepLogs: [],
  waterLogs: [],
  workoutLogs: [],
  dailyCheckins: [],
  goals: [],
};

type BillLike = Record<string, unknown> & {
  id?: string;
  name?: string;
  amount?: number;
  monthly_payment?: number;
  next_due_at?: string;
  next_payment_at?: string;
};

export function CommandCenterScreen() {
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
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const tasks = tasksQuery.data ?? [];
  const projects = projectsQuery.data ?? [];
  const finance = financeQuery.data ?? emptyFinance;
  const health = healthQuery.data ?? emptyHealth;
  const todayKey = localDateKey(now);
  const month = todayKey.slice(0, 7);

  const todayTasks = tasks.filter(
    (task) => task.status !== "CANCELLED" && (isToday(task.due_at) || isToday(task.scheduled_at)),
  );
  const timeline = todayTasks
    .filter((task) => task.scheduled_at)
    .sort((a, b) => String(a.scheduled_at).localeCompare(String(b.scheduled_at)))
    .slice(0, 8);
  const queue = todayTasks
    .filter((task) => task.status !== "COMPLETED" && !task.parent_id)
    .sort((a, b) => priorityScore(b) - priorityScore(a) || String(a.due_at).localeCompare(String(b.due_at)))
    .slice(0, 6);
  const waiting = tasks.filter(
    (task) =>
      task.status === "WAITING" ||
      Boolean(task.next_follow_up_at && new Date(task.next_follow_up_at) <= now),
  );
  const completed = todayTasks.filter((task) => task.status === "COMPLETED").length;
  const important = [...todayTasks]
    .filter((task) => task.status !== "COMPLETED")
    .sort((a, b) => priorityScore(b) - priorityScore(a) || String(a.due_at).localeCompare(String(b.due_at)))[0];
  const estimate = todayTasks.reduce((sum, task) => sum + (task.estimate_minutes ?? 0), 0);
  const actual = todayTasks.reduce((sum, task) => sum + (task.actual_minutes ?? 0), 0);
  const completionRate = todayTasks.length ? Math.round((completed / todayTasks.length) * 100) : 0;

  const monthTransactions = finance.transactions.filter((item) => item.occurred_at.startsWith(month));
  const income = monthTransactions
    .filter((item) => item.type === "INCOME")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const expense = monthTransactions
    .filter((item) => item.type === "EXPENSE")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const budgetTotal = finance.budgets
    .filter((item) => String(item.month).startsWith(month))
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const remainingBudget = budgetTotal ? Math.max(0, budgetTotal - expense) : Math.max(0, income - expense);
  const recentTransactions = [...finance.transactions]
    .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
    .slice(0, 8);
  const bills = (
    [...finance.recurringExpenses, ...finance.subscriptions, ...finance.loans] as BillLike[]
  )
    .sort((a, b) =>
      String(a.next_due_at ?? a.next_payment_at ?? "9999").localeCompare(
        String(b.next_due_at ?? b.next_payment_at ?? "9999"),
      ),
    )
    .slice(0, 3);

  const water = health.waterLogs
    .filter((item) => localDateKey(new Date(item.recorded_at)) === todayKey)
    .reduce((sum, item) => sum + item.amount_ml, 0);
  const latestSleep = health.sleepLogs[0];
  const latestCheckin =
    health.dailyCheckins.find((item) => item.date === todayKey) ?? health.dailyCheckins[0];
  const sleepHours = latestSleep
    ? Math.max(
        0,
        (new Date(latestSleep.wake_at).getTime() - new Date(latestSleep.sleep_at).getTime()) / 3_600_000,
      )
    : 0;
  const weeklyWorkouts = health.workoutLogs.filter(
    (item) => now.getTime() - new Date(item.started_at).getTime() < 7 * 86_400_000,
  );
  const activityMinutes = weeklyWorkouts.reduce((sum, item) => sum + item.duration_minutes, 0);
  const todayCalories = health.workoutLogs
    .filter((item) => localDateKey(new Date(item.started_at)) === todayKey)
    .reduce((sum, item) => sum + (item.calories ?? 0), 0);
  const steps =
    latestCheckin?.steps ??
    health.workoutLogs
      .filter((item) => localDateKey(new Date(item.started_at)) === todayKey)
      .reduce((sum, item) => sum + (item.steps ?? 0), 0);
  const activityProgress = Math.min(100, Math.round((activityMinutes / 180) * 100));
  const waterProgress = Math.min(100, Math.round((water / 2500) * 100));

  const projectById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );

  if (workspace.isLoading || tasksQuery.isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.ambient} />
        <div className="h-[70vh] animate-pulse border border-border bg-surface-raised/40" />
      </div>
    );
  }

  const toggleTask = (task: TaskRecord) => {
    if (task.status === "COMPLETED") {
      taskActions.update.mutate({
        id: task.id,
        values: { status: "TODO", completed_at: null, ended_at: null },
      });
      return;
    }
    taskActions.complete.mutate(task);
  };

  return (
    <div className={styles.page}>
      <div className={styles.ambient} aria-hidden="true" />

      <motion.section
        className={styles.topGrid}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className={styles.identity}>
          <p className={styles.dateLine}>{formatCurrentDate(now)} · {formatClock(now)}</p>
          <h1 className={styles.greeting}>{greeting(now)}，{workspace.data?.displayName || "岱旋"}</h1>
          <p className={styles.quote}>{QUOTES[now.getDay()]}</p>
        </div>

        <div className={styles.priority}>
          <div className={styles.priorityLabel}>
            <Sparkles className="size-4" />
            今天最重要的一件事
          </div>
          {important ? (
            <button className={styles.priorityButton} type="button" onClick={() => setSelected(important)}>
              <span className={styles.priorityCheck}><Circle className="size-3" /></span>
              <span className={styles.priorityCopy}>
                <strong>{important.title}</strong>
                <small>
                  {important.description ||
                    (important.estimate_minutes
                      ? `预计 ${important.estimate_minutes} 分钟 · 点击查看完成标准`
                      : "点击补充完成标准")}
                </small>
              </span>
              <Pencil className="size-4 text-muted" />
            </button>
          ) : (
            <button className={styles.priorityButton} type="button" onClick={() => setQuickCreateOpen(true)}>
              <span className={styles.priorityCheck}><Plus className="size-3" /></span>
              <span className={styles.priorityCopy}>
                <strong>设定今天的关键动作</strong>
                <small>先决定真正重要的一件事，再处理其他输入。</small>
              </span>
            </button>
          )}
        </div>
      </motion.section>

      <motion.section
        className={styles.commandBar}
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08, duration: 0.35 }}
      >
        <span className={styles.commandIcon}><Bot className="size-4" /></span>
        <div className={styles.commandCopy}>
          <strong>输入一句话，改变今天</strong>
          <span>DeepSeek 尚未配置；现在可先用快速记录写入任务、支出、饮水和笔记。</span>
        </div>
        <div className={styles.commandActions}>
          <Button asChild variant="ghost" size="sm">
            <Link href="/settings"><Settings2 data-icon="inline-start" />配置 AI</Link>
          </Button>
          <Button size="sm" onClick={() => setQuickCreateOpen(true)}>
            <Plus data-icon="inline-start" />快速记录
          </Button>
        </div>
      </motion.section>

      <div className={styles.mainGrid}>
        <PointerSpotlight className={`${styles.panel} ${styles.taskDeck}`}>
          <header className={styles.panelHeader}>
            <div>
              <h2>任务流</h2>
              <p>{todayTasks.length} 项今日任务 · {waiting.length} 项待跟进</p>
            </div>
            <div className={styles.panelTools}>
              <Button asChild variant="ghost" size="sm"><Link href="/tasks">全部任务<ChevronRight /></Link></Button>
              <Button size="sm" onClick={() => setQuickCreateOpen(true)}><Plus data-icon="inline-start" />新建</Button>
            </div>
          </header>

          <div className={styles.taskGrid}>
            <section className={styles.timelineLane}>
              <div className={styles.laneHeader}>
                <span>今日时间线</span>
                <span>{timeline.length} 项已安排</span>
              </div>
              {timeline.length ? (
                <motion.ol layout className={styles.timeline}>
                  <AnimatePresence initial={false}>
                    {timeline.map((task) => (
                      <motion.li
                        layout
                        key={task.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className={[
                          styles.timelineItem,
                          task.status === "COMPLETED" ? styles.done : "",
                          isCurrentTask(task, now) ? styles.current : "",
                        ].join(" ")}
                      >
                        <time>{formatTaskTime(task.scheduled_at)}</time>
                        <button
                          className={styles.timelineNode}
                          aria-label={task.status === "COMPLETED" ? "恢复任务" : "完成任务"}
                          type="button"
                          onClick={() => toggleTask(task)}
                        >
                          {task.status === "COMPLETED" ? <Check /> : <span />}
                        </button>
                        <button className={styles.timelineBody} type="button" onClick={() => setSelected(task)}>
                          <strong>{task.title}</strong>
                          <small>
                            {task.status === "IN_PROGRESS"
                              ? "正在进行"
                              : task.estimate_minutes
                                ? `预计 ${task.estimate_minutes} 分钟`
                                : task.description || "点击查看详情"}
                          </small>
                        </button>
                        <div className={styles.timelineActions}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              taskActions.update.mutate({
                                id: task.id,
                                values: {
                                  scheduled_at: addToDate(task.scheduled_at, 1, "day"),
                                  due_at: task.due_at ? addToDate(task.due_at, 1, "day") : null,
                                },
                              })
                            }
                          >
                            延期
                          </Button>
                          <Button size="icon" variant="ghost" aria-label="编辑任务" onClick={() => setSelected(task)}>
                            <Clock3 />
                          </Button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ol>
              ) : (
                <div className={styles.emptyState}>
                  <div>
                    <CalendarClock className="mx-auto mb-2 size-6 text-primary" />
                    今天还没有按时间安排的任务
                  </div>
                </div>
              )}
            </section>

            <section className={styles.queueLane}>
              <div className={styles.laneHeader}>
                <span>今日任务</span>
                <span>{completed}/{todayTasks.length || 0} 完成</span>
              </div>
              {queue.length ? (
                <motion.ul layout className={styles.queueList}>
                  <AnimatePresence initial={false}>
                    {queue.map((task) => {
                      const project = task.project_id ? projectById.get(task.project_id) : undefined;
                      return (
                        <motion.li
                          layout
                          key={task.id}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          className={styles.queueItem}
                        >
                          <button className={styles.queueCheck} type="button" onClick={() => toggleTask(task)}>
                            <Circle />
                          </button>
                          <button className={styles.queueBody} type="button" onClick={() => setSelected(task)}>
                            <strong>{task.title}</strong>
                            <small>
                              {task.waiting_for
                                ? `等待：${task.waiting_for}`
                                : task.due_at
                                  ? `截止 ${formatDateTime(task.due_at)}`
                                  : task.description || "未安排具体时间"}
                            </small>
                          </button>
                          <div className={styles.queueAside}>
                            {priorityScore(task) >= 3 ? <span className={styles.priorityDot} /> : null}
                            <span
                              className={styles.tag}
                              style={project?.color ? { borderColor: project.color, color: project.color } : undefined}
                            >
                              {project?.name ?? (task.area === "WORK" ? "工作" : "生活")}
                            </span>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </motion.ul>
              ) : (
                <div className={styles.emptyState}>今天没有待执行任务</div>
              )}
            </section>
          </div>

          <footer className={styles.deckFooter}>
            <DeckStat label="今日完成率" value={`${completionRate}%`} />
            <DeckStat label="预计用时" value={formatMinutes(estimate)} />
            <DeckStat label="实际用时" value={formatMinutes(actual)} />
            <DeckStat label="待跟进" value={`${waiting.length} 项`} />
          </footer>
        </PointerSpotlight>

        <div className={styles.signalStack}>
          <PointerSpotlight className={`${styles.panel} ${styles.financePanel}`}>
            <header className={styles.panelHeader}>
              <div>
                <h2>资金流</h2>
                <p>{now.getMonth() + 1} 月 · 工资与日常开销</p>
              </div>
              <div className={styles.panelTools}>
                <Button size="icon" variant="ghost" aria-label={hidden ? "显示金额" : "隐藏金额"} onClick={toggleAmounts}>
                  {hidden ? <EyeOff /> : <Eye />}
                </Button>
                <Button asChild size="sm" variant="ghost"><Link href="/finance">进入中心<ArrowRight /></Link></Button>
              </div>
            </header>
            <div className={styles.financeMetrics}>
              <MoneyMetric label="收入" value={income} hidden={hidden} tone="success" />
              <MoneyMetric label="支出" value={expense} hidden={hidden} tone="accent" />
              <MoneyMetric label="可支配" value={income - expense} hidden={hidden} />
              <MoneyMetric label="剩余预算" value={remainingBudget} hidden={hidden} />
            </div>
            <div className={styles.financeFlow}>
              <div className={styles.flowRail} />
              <div className={styles.flowNodes}>
                {(recentTransactions.length ? recentTransactions : placeholderTransactions()).map((item, index) => (
                  <FlowNode key={item.id ?? `placeholder-${index}`} item={item} hidden={hidden} />
                ))}
              </div>
            </div>
            {bills[0] ? (
              <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-[11px] text-muted">
                <span>最近账单：{String(bills[0].name ?? "还款")}</span>
                <span>{formatCurrency(Number(bills[0].amount ?? bills[0].monthly_payment ?? 0), hidden)}</span>
              </div>
            ) : null}
          </PointerSpotlight>

          <PointerSpotlight className={`${styles.panel} ${styles.healthPanel}`}>
            <header className={styles.panelHeader}>
              <div>
                <h2>身体信号</h2>
                <p>睡眠、饮水与本周活动</p>
              </div>
              <Button asChild size="sm" variant="ghost"><Link href="/health">健康详情<ChevronRight /></Link></Button>
            </header>
            <div className={styles.healthGrid}>
              <section className={styles.healthSignal}>
                <p className={styles.signalLabel}>睡眠</p>
                <div className={styles.sleepMetric}>
                  <strong>{sleepHours ? sleepHours.toFixed(1) : "—"}</strong>
                  <span>小时</span>
                </div>
                <div className={styles.sleepChart}><SleepSignalChart logs={health.sleepLogs} /></div>
                <p className="text-[10px] text-muted">
                  {latestSleep?.quality ? `昨晚质量 ${latestSleep.quality}/5` : "记录睡眠后生成趋势"}
                </p>
              </section>

              <section className={styles.healthSignal}>
                <p className={styles.signalLabel}>饮水</p>
                <p className={styles.waterMetric}>{(water / 1000).toFixed(2)} L</p>
                <div className={styles.waterVessel}>
                  <motion.div
                    className={styles.waterFill}
                    initial={{ height: 0 }}
                    animate={{ height: `${waterProgress}%` }}
                    transition={{ type: "spring", stiffness: 70, damping: 18 }}
                  />
                </div>
                <div className={styles.quickHealth}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      healthActions.save.mutate({
                        table: "water_logs",
                        values: { amount_ml: 250, recorded_at: new Date().toISOString() },
                      })
                    }
                  >
                    <Droplets data-icon="inline-start" />+250
                  </Button>
                </div>
              </section>

              <section className={styles.healthSignal}>
                <p className={styles.signalLabel}>活动</p>
                <div
                  className={styles.activityRing}
                  style={{ "--ring-progress": `${activityProgress * 3.6}deg` } as CSSProperties}
                >
                  <div className={styles.activityInner}>
                    <strong>{todayCalories || activityMinutes}</strong>
                    <span>{todayCalories ? "kcal" : "分钟 / 周"}</span>
                  </div>
                </div>
                <div className={styles.activityMeta}>
                  <span className="flex items-center gap-1"><Footprints className="size-3" />步数 {steps?.toLocaleString("zh-CN") ?? "—"}</span>
                  <span className="flex items-center gap-1"><Zap className="size-3" />精力 {latestCheckin ? `${latestCheckin.energy}/5` : "—"}</span>
                  <span className="flex items-center gap-1"><HeartPulse className="size-3" />心情 {latestCheckin ? `${latestCheckin.mood}/5` : "—"}</span>
                </div>
              </section>
            </div>
          </PointerSpotlight>
        </div>
      </div>

      <div className={styles.bottomGrid}>
        <PointerSpotlight className={`${styles.panel} ${styles.chartPanel}`}>
          <header className={styles.panelHeader}>
            <div><h2>任务趋势</h2><p>近 7 天完成数与完成率</p></div>
            <TrendingUp className="size-4 text-accent" />
          </header>
          <div className={styles.chartBody}><TaskPulseChart tasks={tasks} /></div>
        </PointerSpotlight>

        <PointerSpotlight className={`${styles.panel} ${styles.datePanel}`}>
          <div className={styles.dateRing}>
            <div className={styles.dateInner}>
              <span>{now.getFullYear()}</span>
              <strong>{String(now.getMonth() + 1).padStart(2, "0")}/{String(now.getDate()).padStart(2, "0")}</strong>
              <small>{new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(now)}</small>
            </div>
          </div>
        </PointerSpotlight>

        <PointerSpotlight className={`${styles.panel} ${styles.chartPanel}`}>
          <header className={styles.panelHeader}>
            <div><h2>收支趋势</h2><p>近 30 天累计资金变化</p></div>
            <WalletCards className="size-4 text-primary" />
          </header>
          <div className={styles.chartBody}><CashFlowChart transactions={finance.transactions} /></div>
        </PointerSpotlight>
      </div>

      <footer className={styles.statusBar}>
        <span className={styles.statusItem}><i className={styles.statusDot} />系统在线</span>
        <span className={styles.statusItem}><TimerReset className="size-3.5" />今日预计 {formatMinutes(estimate)}</span>
        <span className={styles.statusItem}>任务完成率 {completionRate}%</span>
        <span className={`${styles.statusItem} ml-auto`}>数据空间：{workspace.data?.spaceName || "个人空间"}</span>
      </footer>

      <TaskEditorDialog
        key={selected?.id ?? "closed"}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        spaceId={workspace.data?.spaceId}
        projects={projects}
        task={selected}
      />
    </div>
  );
}

function DeckStat({ label, value }: { label: string; value: string }) {
  return <div className={styles.deckStat}><span>{label}</span><strong>{value}</strong></div>;
}

function MoneyMetric({
  label,
  value,
  hidden,
  tone,
}: {
  label: string;
  value: number;
  hidden: boolean;
  tone?: "success" | "accent";
}) {
  return (
    <div className={styles.moneyMetric}>
      <span>{label}</span>
      <strong className={tone === "success" ? "text-success" : tone === "accent" ? "text-accent" : ""}>
        <SpringNumber value={value} prefix="¥" decimals={value % 1 ? 2 : 0} hidden={hidden} />
      </strong>
    </div>
  );
}

function FlowNode({ item, hidden }: { item: TransactionRecord; hidden: boolean }) {
  const positive = item.type === "INCOME";
  return (
    <div className={styles.flowNode}>
      <strong>{item.merchant || (item.type === "TRANSFER" ? "转账" : positive ? "收入" : "支出")}</strong>
      <i />
      <b className={positive ? "text-success" : item.type === "EXPENSE" ? "text-accent" : ""}>
        {hidden ? "••" : `${positive ? "+" : item.type === "EXPENSE" ? "−" : ""}${Math.abs(Number(item.amount)).toLocaleString("zh-CN")}`}
      </b>
      <small>{new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit" }).format(new Date(item.occurred_at))}</small>
    </div>
  );
}

function placeholderTransactions(): TransactionRecord[] {
  return Array.from({ length: 8 }, (_, index) => ({
    id: `placeholder-${index}`,
    space_id: "",
    account_id: "",
    category_id: null,
    type: "TRANSFER",
    amount: 0,
    occurred_at: new Date(Date.now() - (7 - index) * 86_400_000).toISOString(),
    merchant: ["工资", "餐饮", "交通", "订阅", "生活", "储蓄", "通勤", "其他"][index],
    note: null,
    transfer_ref: null,
    created_at: "",
    updated_at: "",
  }));
}

function greeting(now: Date) {
  const hour = now.getHours();
  if (hour < 5) return "夜深了";
  if (hour < 11) return "早上好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

function formatClock(now: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
}

function formatTaskTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function formatMinutes(minutes: number) {
  if (!minutes) return "0h 0m";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours ? `${hours}h ` : ""}${rest}m`;
}

function priorityScore(task: TaskRecord) {
  return { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 }[task.priority];
}

function isCurrentTask(task: TaskRecord, now: Date) {
  if (!task.scheduled_at || task.status === "COMPLETED") return false;
  const start = new Date(task.scheduled_at).getTime();
  const end = start + (task.estimate_minutes ?? 60) * 60_000;
  return now.getTime() >= start && now.getTime() < end;
}
