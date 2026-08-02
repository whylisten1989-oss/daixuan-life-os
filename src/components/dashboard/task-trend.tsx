"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { localDateKey } from "@/lib/date";
import type { TaskRecord } from "@/types/life";

export default function TaskTrend({ tasks }: { tasks: TaskRecord[] }) {
  const data = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); const key = localDateKey(date); return { label: new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(date), value: tasks.filter((task) => task.completed_at && localDateKey(new Date(task.completed_at)) === key).length }; });
  return <div className="h-32 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}><defs><linearGradient id="taskArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--primary)" stopOpacity={0.35} /><stop offset="1" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 10 }} /><Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 }} /><Area dataKey="value" name="完成任务" type="monotone" stroke="var(--primary)" strokeWidth={2} fill="url(#taskArea)" animationDuration={500} /></AreaChart></ResponsiveContainer></div>;
}
