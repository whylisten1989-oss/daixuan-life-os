"use client";

import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { localDateKey } from "@/lib/date";
import type { HealthData } from "@/types/life";

export function HealthTrends({ data, days }: { data: HealthData; days: 7 | 30 }) {
  const points = Array.from({ length: days }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - (days - 1 - index)); const key = localDateKey(date);
    const sleep = data.sleepLogs.find((item) => localDateKey(new Date(item.wake_at)) === key);
    const checkin = data.dailyCheckins.find((item) => item.date === key);
    return {
      label: days === 7 ? new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(date) : `${date.getMonth() + 1}/${date.getDate()}`,
      water: data.waterLogs.filter((item) => localDateKey(new Date(item.recorded_at)) === key).reduce((sum, item) => sum + item.amount_ml, 0) / 1000,
      sleep: sleep ? (new Date(sleep.wake_at).getTime() - new Date(sleep.sleep_at).getTime()) / 3600000 : null,
      energy: checkin?.energy ?? null, mood: checkin?.mood ?? null, stress: checkin?.stress ?? null,
    };
  });
  return <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={points} margin={{ top: 14, right: 6, left: -22, bottom: 0 }}><CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="2 6" /><XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 10 }} interval={days === 30 ? 4 : 0} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 10 }} /><Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 }} /><Bar dataKey="water" name="饮水 L" fill="var(--primary)" opacity={0.45} radius={[2, 2, 0, 0]} animationDuration={500} /><Line connectNulls dataKey="sleep" name="睡眠 h" stroke="var(--accent)" strokeWidth={2} dot={false} animationDuration={600} /><Line connectNulls dataKey="energy" name="精力" stroke="var(--success)" strokeWidth={1.5} dot={false} /><Line connectNulls dataKey="stress" name="压力" stroke="var(--danger)" strokeWidth={1.5} dot={false} /></ComposedChart></ResponsiveContainer></div>;
}
