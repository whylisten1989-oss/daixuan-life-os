"use client";

import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SleepLogRecord, TaskRecord, TransactionRecord } from "@/types/life";

const chartTooltip = {
  background: "color-mix(in srgb, var(--surface) 94%, transparent)",
  border: "1px solid var(--line-strong)",
  borderRadius: 8,
  boxShadow: "0 18px 48px rgb(0 0 0 / 0.3)",
  fontSize: 11,
};

function keyOf(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shortLabel(date: Date) {
  return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

export function TaskPulseChart({ tasks }: { tasks: TaskRecord[] }) {
  const points = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = keyOf(date);
    const planned = tasks.filter((task) => {
      const source = task.scheduled_at ?? task.due_at;
      return Boolean(source && keyOf(new Date(source!)) === key);
    }).length;
    const completed = tasks.filter((task) => task.completed_at && keyOf(new Date(task.completed_at)) === key).length;
    return {
      label: shortLabel(date),
      completed,
      rate: planned ? Math.min(100, Math.round((completed / planned) * 100)) : completed ? 100 : 0,
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={points} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="taskBars" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.95} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.08} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.45} />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--subtle)", fontSize: 10 }} />
        <YAxis yAxisId="count" axisLine={false} tickLine={false} tick={{ fill: "var(--subtle)", fontSize: 10 }} allowDecimals={false} />
        <YAxis yAxisId="rate" orientation="right" domain={[0, 100]} hide />
        <Tooltip contentStyle={chartTooltip} cursor={{ fill: "color-mix(in srgb, var(--surface-raised) 55%, transparent)" }} />
        <Bar yAxisId="count" dataKey="completed" fill="url(#taskBars)" radius={[3, 3, 0, 0]} maxBarSize={34} animationDuration={800} />
        <Line yAxisId="rate" dataKey="rate" type="monotone" stroke="var(--foreground)" strokeWidth={1.8} dot={{ r: 2.5, fill: "var(--background)", stroke: "var(--foreground)" }} animationDuration={900} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function CashFlowChart({ transactions }: { transactions: TransactionRecord[] }) {
  let runningIncome = 0;
  let runningExpense = 0;
  const points = Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (29 - index));
    const key = keyOf(date);
    const sameDay = transactions.filter((item) => keyOf(new Date(item.occurred_at)) === key);
    runningIncome += sameDay.filter((item) => item.type === "INCOME").reduce((sum, item) => sum + Number(item.amount), 0);
    runningExpense += sameDay.filter((item) => item.type === "EXPENSE").reduce((sum, item) => sum + Number(item.amount), 0);
    return {
      label: shortLabel(date),
      income: runningIncome,
      expense: runningExpense,
      balance: runningIncome - runningExpense,
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={points} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5fa7ff" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#5fa7ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.38} />
        <XAxis dataKey="label" axisLine={false} tickLine={false} interval={6} tick={{ fill: "var(--subtle)", fontSize: 10 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--subtle)", fontSize: 10 }} />
        <Tooltip contentStyle={chartTooltip} formatter={(value) => `¥${Number(value).toLocaleString("zh-CN")}`} />
        <Area type="monotone" dataKey="balance" stroke="#5fa7ff" strokeWidth={2} fill="url(#balanceFill)" animationDuration={900} />
        <Area type="monotone" dataKey="income" stroke="var(--success)" strokeWidth={1.35} fill="transparent" strokeDasharray="4 4" animationDuration={1050} />
        <Area type="monotone" dataKey="expense" stroke="var(--accent)" strokeWidth={1.35} fill="transparent" animationDuration={1150} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SleepSignalChart({ logs }: { logs: SleepLogRecord[] }) {
  const points = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = keyOf(date);
    const log = logs.find((item) => keyOf(new Date(item.wake_at)) === key);
    const hours = log ? Math.max(0, (new Date(log.wake_at).getTime() - new Date(log.sleep_at).getTime()) / 3_600_000) : 0;
    return { label: shortLabel(date), hours: Number(hours.toFixed(1)) };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={points} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="sleepFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="hours" stroke="var(--primary)" strokeWidth={2} fill="url(#sleepFill)" animationDuration={850} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
