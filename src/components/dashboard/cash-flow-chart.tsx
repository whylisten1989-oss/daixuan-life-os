"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cashFlow } from "@/data/demo";

export default function CashFlowChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={cashFlow} margin={{ top: 10, right: 4, bottom: 0, left: -30 }}>
        <defs>
          <linearGradient id="cashFlowFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.24} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--subtle)", fontSize: 10 }} interval={2} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--subtle)", fontSize: 10 }} />
        <Tooltip contentStyle={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }} formatter={(value) => [`${Number(value).toFixed(1)}k`, "现金流"]} />
        <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fill="url(#cashFlowFill)" isAnimationActive animationDuration={700} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
