"use client";

import { Activity, BatteryCharging, BedDouble, Droplets, HeartPulse, Plus, Smile, Waves } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SignalMeter } from "@/components/dashboard/signal-meter";
import { ModuleHeader } from "./module-header";

const week = [58, 64, 72, 68, 79, 75, 82];

export function HealthScreen() {
  const [water, setWater] = useState(1500);
  return (
    <div className="mx-auto max-w-[1380px] px-4 py-7 sm:px-6 lg:px-8">
      <ModuleHeader icon={HeartPulse} title="健康中心" description="记录身体信号，不用单日数字定义自己。" action={<Button onClick={() => setWater((value) => value + 250)}><Plus data-icon="inline-start" />快速记录</Button>} />
      <section className="mt-7 grid grid-cols-2 gap-x-4 gap-y-7 border-y border-line-strong py-6 sm:grid-cols-4 lg:grid-cols-6">
        <HealthMetric icon={BedDouble} label="睡眠" value="7h 24m" detail="质量 82" />
        <HealthMetric icon={Droplets} label="饮水" value={`${(water / 1000).toFixed(2)}L`} detail="目标 2.5L" />
        <HealthMetric icon={Activity} label="运动" value="4 / 5" detail="本周次数" />
        <HealthMetric icon={BatteryCharging} label="精力" value="72" detail="稳定" />
        <HealthMetric icon={Smile} label="心情" value="4.2 / 5" detail="平和" />
        <HealthMetric icon={Waves} label="压力" value="3 / 10" detail="较低" />
      </section>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section><div className="flex items-baseline justify-between"><h2 className="font-semibold">一周身体节律</h2><span className="text-xs text-muted">综合状态</span></div><div className="mt-6 flex h-56 items-end justify-between gap-3 border-b border-l border-border px-4 pb-0">{week.map((value, index) => <div key={`${value}-${index}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] text-muted">{value}</span><div className="w-full max-w-9 bg-primary/75" style={{ height: `${value}%` }} /><span className="pb-2 text-[10px] text-subtle">{["一", "二", "三", "四", "五", "六", "日"][index]}</span></div>)}</div></section>
        <section className="border-l border-border pl-6"><h2 className="font-semibold">今日状态</h2><div className="mt-6 flex justify-around"><SignalMeter value={72} label="精力" /><SignalMeter value={84} label="心情" tone="accent" /></div><div className="mt-7 flex flex-col gap-3 text-sm"><Goal label="饮水" value={water} target={2500} unit="ml" /><Goal label="站立" value={8} target={10} unit="小时" /><Goal label="运动" value={42} target={60} unit="分钟" /></div></section>
      </div>
    </div>
  );
}

function HealthMetric({ icon: Icon, label, value, detail }: { icon: typeof BedDouble; label: string; value: string; detail: string }) { return <div><div className="flex items-center gap-2 text-xs text-muted"><Icon className="size-4" />{label}</div><p className="mt-3 text-xl font-medium numeric">{value}</p><p className="mt-1 text-xs text-success">{detail}</p></div>; }
function Goal({ label, value, target, unit }: { label: string; value: number; target: number; unit: string }) { return <div><div className="mb-1.5 flex justify-between"><span>{label}</span><span className="text-muted numeric">{value}/{target} {unit}</span></div><div className="h-1.5 rounded-full bg-surface-sunken"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (value / target) * 100)}%` }} /></div></div>; }
