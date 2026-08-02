"use client";

import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  ArrowRight,
  Bot,
  CalendarClock,
  Check,
  ChevronRight,
  Circle,
  Clock3,
  Droplets,
  Dumbbell,
  Eye,
  EyeOff,
  HeartPulse,
  ListFilter,
  Moon,
  MoreHorizontal,
  Pencil,
  Plus,
  Settings2,
  Smile,
  Sparkles,
  TimerReset,
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
import { useUiStore } from "@/store/ui-store";
import type { FinanceData, HealthData, TaskRecord } from "@/types/life";
import { CashFlowChart } from "./command-center-charts";
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
    .sort((a, b) => String(a.scheduled_at).localeCompare(String(b.scheduled_at)));
  const unscheduled = todayTasks
    .filter((task) => !task.scheduled_at && !task.parent_id)
    .sort((a, b) => priorityScore(b) - priorityScore(a));
  const visibleTasks = [...timeline, ...unscheduled.filter((task) => !timeline.some((item) => item.id === task.id))].slice(0, 10);
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
  const budgetProgress = budgetTotal ? Math.min(100, Math.round((expense / budgetTotal) * 100)) : 0;

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
  const weeklyWorkoutMinutes = weeklyWorkouts.reduce((sum, item) => sum + item.duration_minutes, 0);
  const weeklyActivity = buildWeeklyActivity(health.workoutLogs, now);

  const projectById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );

  if (workspace.isLoading || tasksQuery.isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.ambient} />
        <div className="h-[72vh] animate-pulse border border-border bg-surface-raised/35" />
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

      <div className={styles.cockpitGrid}>
        <motion.section
          className={styles.hero}
          initial={{ opacity: 0, y: 7 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
        >
          <div className={styles.identity}>
            <p className={styles.dateLine}>{formatCurrentDate(now)} · {formatClock(now)}</p>
            <h1 className={styles.greeting}>{greeting(now)}，{workspace.data?.displayName || "岱旋"}</h1>
            <p className={styles.quote}>{QUOTES[now.getDay()]}</p>
          </div>

          <div className={styles.priority}>
            <div className={styles.priorityLabel}>
              <Sparkles className="size-3.5" />
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
                <Pencil className="size-3.5 text-muted" />
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

        <PointerSpotlight className={`${styles.panel} ${styles.financePanel}`}>
          <header className={styles.panelHeader}>
            <div>
              <h2>财务信号 <span>· {now.getFullYear()}年{now.getMonth() + 1}月</span></h2>
            </div>
            <div className={styles.panelTools}>
              <Button size="icon" variant="ghost" aria-label={hidden ? "显示金额" : "隐藏金额"} onClick={toggleAmounts}>
                {hidden ? <EyeOff /> : <Eye />}
              </Button>
              <Button asChild size="sm" variant="ghost"><Link href="/finance">编辑金额<ChevronRight /></Link></Button>
            </div>
          </header>

          <div className={styles.financeMetrics}>
            <MoneyMetric label="月收入" value={income} hidden={hidden} tone="success" />
            <MoneyMetric label="月支出" value={expense} hidden={hidden} tone="accent" />
            <MoneyMetric label="剩余预算" value={remainingBudget} hidden={hidden} />
            <div className={styles.budgetMetric}>
              <span>预算进度</span>
              <strong>{budgetProgress}%</strong>
              <div><i style={{ width: `${budgetProgress}%` }} /></div>
            </div>
          </div>

          <div className={styles.financeChartHead}>
            <span>现金流趋势（近 30 天）</span>
            <span>收入 · 支出 · 余额</span>
          </div>
          <div className={styles.financeChart}>
            <CashFlowChart transactions={finance.transactions} />
          </div>
        </PointerSpotlight>

        <PointerSpotlight className={`${styles.panel} ${styles.taskPanel}`}>
          <header className={styles.taskHeader}>
            <div className={styles.taskTabs}>
              <button type="button" className={styles.activeTab}>今日时间轴</button>
              <button type="button">待办（{Math.max(0, todayTasks.length - completed)}）</button>
            </div>
            <div className={styles.panelTools}>
              <span className={styles.taskCount}>{visibleTasks.length} 项</span>
              <Button size="icon" variant="ghost" aria-label="任务筛选"><ListFilter /></Button>
              <Button size="icon" variant="ghost" aria-label="更多任务操作"><MoreHorizontal /></Button>
            </div>
          </header>

          <div className={styles.timelineViewport}>
            {visibleTasks.length ? (
              <motion.ol layout className={styles.timeline}>
                <AnimatePresence initial={false}>
                  {visibleTasks.map((task) => {
                    const project = task.project_id ? projectById.get(task.project_id) : undefined;
                    return (
                      <motion.li
                        layout
                        key={task.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className={[
                          styles.timelineItem,
                          task.status === "COMPLETED" ? styles.done : "",
                          isCurrentTask(task, now) ? styles.current : "",
                        ].join(" ")}
                      >
                        <time>{task.scheduled_at ? formatTaskTime(task.scheduled_at) : "待定"}</time>
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
                        <span
                          className={styles.taskTag}
                          style={project?.color ? { borderColor: project.color, color: project.color } : undefined}
                        >
                          {project?.name ?? (task.area === "WORK" ? "工作" : "生活")}
                        </span>
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
                    );
                  })}
                </AnimatePresence>
              </motion.ol>
            ) : (
              <EmptyTimeline onCreate={() => setQuickCreateOpen(true)} />
            )}
          </div>

          <button className={styles.addTaskRow} type="button" onClick={() => setQuickCreateOpen(true)}>
            <Plus className="size-3.5" /> 添加事项
          </button>

          <footer className={styles.taskFooter}>
            <FooterStat label="专注时长" value={formatMinutes(actual)} icon={<TimerReset />} />
            <FooterStat label="今日剩余" value={formatMinutes(Math.max(0, estimate - actual))} />
            <FooterStat label="累计完成" value={`${completed} / ${todayTasks.length}`} />
            <div className={styles.completionMeter}>
              <span>完成率 {completionRate}%</span>
              <div><i style={{ width: `${completionRate}%` }} /></div>
            </div>
          </footer>
        </PointerSpotlight>

        <PointerSpotlight className={`${styles.panel} ${styles.healthPanel}`}>
          <header className={styles.panelHeader}>
            <div>
              <h2>健康信号 <span>· 本周概览</span></h2>
            </div>
            <Button asChild size="sm" variant="ghost"><Link href="/health">健康详情<ChevronRight /></Link></Button>
          </header>

          <div className={styles.healthMetrics}>
            <RingMetric
              label="睡眠"
              value={sleepHours ? `${sleepHours.toFixed(1)}h` : "—"}
              progress={sleepHours ? Math.min(100, (sleepHours / 8) * 100) : 0}
              status={sleepHours >= 7 ? "良好" : sleepHours ? "偏少" : "未记录"}
              icon={<Moon />}
              tone="green"
            />
            <RingMetric
              label="饮水"
              value={`${Math.round(water / 250) / 4}L`}
              progress={Math.min(100, (water / 2500) * 100)}
              status={`${Math.round(water / 250)} / 10 杯`}
              icon={<Droplets />}
              tone="cyan"
            />
            <RingMetric
              label="精力"
              value={latestCheckin ? `${latestCheckin.energy}/5` : "—"}
              progress={latestCheckin ? latestCheckin.energy * 20 : 0}
              status={latestCheckin ? "今日状态" : "未记录"}
              icon={<Zap />}
              tone="gold"
            />
            <RingMetric
              label="心情"
              value={latestCheckin ? `${latestCheckin.mood}/5` : "—"}
              progress={latestCheckin ? latestCheckin.mood * 20 : 0}
              status={latestCheckin ? "今日状态" : "未记录"}
              icon={<Smile />}
              tone="gold"
            />
            <RingMetric
              label="运动"
              value={`${weeklyWorkouts.length}/5`}
              progress={Math.min(100, (weeklyWorkouts.length / 5) * 100)}
              status={weeklyWorkouts.length >= 4 ? "达标" : "本周"}
              icon={<Dumbbell />}
              tone="green"
            />
          </div>

          <div className={styles.healthFooter}>
            <div>
              <span>本周运动时长</span>
              <strong>{weeklyWorkoutMinutes} 分钟</strong>
            </div>
            <div className={styles.weekBars}>
              {weeklyActivity.map((item) => (
                <div key={item.key} className={styles.weekBar}>
                  <i style={{ height: `${Math.max(8, item.progress)}%` }} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
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
              <Droplets data-icon="inline-start" />+250ml
            </Button>
          </div>
        </PointerSpotlight>

        <PointerSpotlight className={`${styles.panel} ${styles.aiPanel}`}>
          <div className={styles.aiContour} aria-hidden="true" />
          <div className={styles.aiOrb}><Bot /></div>
          <div className={styles.aiCopy}>
            <p>AI 助手</p>
            <h2>AI 服务尚未配置</h2>
            <span>配置后，可将一句话转换为任务、记账和健康记录，并在写入前让你确认。</span>
            <div className={styles.aiActions}>
              <Button asChild size="sm" className={styles.configureButton}>
                <Link href="/settings"><Settings2 data-icon="inline-start" />去配置</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href="/ai">了解更多<ArrowRight /></Link>
              </Button>
            </div>
          </div>
        </PointerSpotlight>
      </div>

      <footer className={styles.statusBar}>
        <span className={styles.statusItem}><i className={styles.statusDot} />系统在线</span>
        <span className={styles.statusItem}><Activity className="size-3.5" />RLS 已启用</span>
        <span className={styles.statusItem}>待跟进 {waiting.length} 项</span>
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

function EmptyTimeline({ onCreate }: { onCreate: () => void }) {
  const slots = ["07:00", "09:30", "13:00", "16:00", "20:30"];
  return (
    <div className={styles.emptyTimeline}>
      {slots.map((slot, index) => (
        <div key={slot} className={styles.emptySlot}>
          <time>{slot}</time>
          <span />
          <div>
            {index === 1 ? (
              <button type="button" onClick={onCreate}>
                <Plus className="size-3.5" />在这里安排第一个任务
              </button>
            ) : (
              <i />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function FooterStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={styles.footerStat}>
      <span>{icon}{label}</span>
      <strong>{value}</strong>
    </div>
  );
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
        <SpringNumber value={value} prefix="¥ " decimals={value % 1 ? 2 : 0} hidden={hidden} />
      </strong>
    </div>
  );
}

function RingMetric({
  label,
  value,
  progress,
  status,
  icon,
  tone,
}: {
  label: string;
  value: string;
  progress: number;
  status: string;
  icon: React.ReactNode;
  tone: "green" | "cyan" | "gold";
}) {
  const style = {
    "--ring-progress": `${Math.max(0, Math.min(100, progress)) * 3.6}deg`,
  } as CSSProperties;

  return (
    <div className={styles.ringMetric}>
      <p>{label}</p>
      <div className={`${styles.ring} ${styles[`ring${tone}`]}`} style={style}>
        <div>
          {icon}
          <strong>{value}</strong>
        </div>
      </div>
      <span>{status}</span>
    </div>
  );
}

function buildWeeklyActivity(logs: HealthData["workoutLogs"], now: Date) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = localDateKey(date);
    const minutes = logs
      .filter((item) => localDateKey(new Date(item.started_at)) === key)
      .reduce((sum, item) => sum + item.duration_minutes, 0);
    return {
      key,
      label: ["日", "一", "二", "三", "四", "五", "六"][date.getDay()],
      progress: Math.min(100, (minutes / 60) * 100),
    };
  });
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

function formatTaskTime(value: string) {
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
