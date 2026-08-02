"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { TransactionRecord } from "@/types/life";

export default function FinanceTrend({ transactions }: { transactions: TransactionRecord[] }) {
  const today = new Date();
  const points = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today); date.setDate(today.getDate() - (29 - index));
    const key = date.toISOString().slice(0, 10);
    return { date: `${date.getMonth() + 1}/${date.getDate()}`, value: transactions.filter((item) => item.type === "EXPENSE" && item.occurred_at.startsWith(key)).reduce((sum, item) => sum + Number(item.amount), 0) };
  });
  return <div className="mt-4 h-52 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={points} margin={{ left: 0, right: 6, top: 10, bottom: 0 }}><defs><linearGradient id="financeArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--accent)" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 10 }} interval={5} /><Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 }} formatter={(value) => [`¥${Number(value).toFixed(2)}`, "支出"]} /><Area type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2} fill="url(#financeArea)" animationDuration={500} /></AreaChart></ResponsiveContainer></div>;
}
