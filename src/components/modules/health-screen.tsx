"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { Activity, BatteryCharging, BedDouble, Droplets, Footprints, HeartPulse, Plus, Scale, Smile, Waves } from "lucide-react";
import { useMemo, useState } from "react";
import { HealthRecordDialog, type HealthAction } from "@/components/health/health-record-dialog";
import { Button } from "@/components/ui/button";
import { useHealth, useHealthActions } from "@/hooks/use-health";
import { useWorkspace } from "@/hooks/use-workspace";
import { formatDateTime, localDateKey } from "@/lib/date";
import type { HealthData } from "@/types/life";
import { ModuleHeader } from "./module-header";

const HealthTrends = dynamic(() => import("@/components/health/health-trends").then((module) => module.HealthTrends), { ssr: false, loading: () => <div className="h-72 animate-pulse bg-surface-raised" /> });
const empty: HealthData = { sleepLogs: [], waterLogs: [], workoutLogs: [], dailyCheckins: [], goals: [] };

export function HealthScreen() {
  const workspace = useWorkspace();
  const health = useHealth(workspace.data?.spaceId);
  const actions = useHealthActions(workspace.data?.spaceId);
  const [action, setAction] = useState<HealthAction | null>(null);
  const [days, setDays] = useState<7 | 30>(7);
  const [referenceNow] = useState(() => Date.now());
  const data = health.data ?? empty;
  const today = localDateKey();
  const water = data.waterLogs.filter((item) => localDateKey(new Date(item.recorded_at)) === today).reduce((sum, item) => sum + item.amount_ml, 0);
  const latestSleep = data.sleepLogs[0];
  const latestCheckin = data.dailyCheckins.find((item) => item.date === today) ?? data.dailyCheckins[0];
  const sleepHours = latestSleep ? (new Date(latestSleep.wake_at).getTime() - new Date(latestSleep.sleep_at).getTime()) / 3600000 : 0;
  const weeklyWorkouts = data.workoutLogs.filter((item) => referenceNow - new Date(item.started_at).getTime() < 7 * 86400000);
  const streak = useMemo(() => recordStreak(data), [data]);

  const addWater = async (amount: number) => actions.save.mutateAsync({ table: "water_logs", values: { amount_ml: amount, recorded_at: new Date().toISOString() } });
  if (health.isLoading) return <div className="app-page"><div className="h-48 animate-pulse bg-surface-raised" /></div>;
  if (health.error) return <div className="app-page text-danger">健康数据加载失败：{health.error.message}</div>;

  return <div className="app-page">
    <ModuleHeader icon={HeartPulse} title="健康中心" description="记录睡眠、饮水、运动与每日状态，观察长期身体节律。" action={<Button onClick={() => setAction("checkin")}><Plus data-icon="inline-start" />记录状态</Button>} />
    <section className="health-action-strip"><Button variant="subtle" onClick={() => addWater(250)}><Droplets data-icon="inline-start" />+250ml</Button><Button variant="subtle" onClick={() => addWater(500)}><Droplets data-icon="inline-start" />+500ml</Button><Button variant="ghost" onClick={() => setAction("water")}>自定义饮水</Button><Button variant="ghost" onClick={() => setAction("sleep")}>记录睡眠</Button><Button variant="ghost" onClick={() => setAction("workout")}>记录运动</Button></section>
    <section className="health-metrics"><HealthMetric icon={BedDouble} label="睡眠" value={latestSleep ? `${sleepHours.toFixed(1)}h` : "—"} detail={latestSleep ? `质量 ${latestSleep.quality ?? "未评"}/5` : "尚未记录"} /><HealthMetric icon={Droplets} label="饮水" value={`${(water / 1000).toFixed(2)}L`} detail={`${Math.min(100, Math.round(water / 2500 * 100))}% 目标`} /><HealthMetric icon={Activity} label="运动" value={`${weeklyWorkouts.length} 次`} detail={`${weeklyWorkouts.reduce((sum, item) => sum + item.duration_minutes, 0)} 分钟`} /><HealthMetric icon={Footprints} label="步数" value={latestCheckin?.steps?.toLocaleString("zh-CN") ?? "—"} detail="今日" /><HealthMetric icon={BatteryCharging} label="精力" value={latestCheckin ? `${latestCheckin.energy}/5` : "—"} detail="今日状态" /><HealthMetric icon={Smile} label="心情" value={latestCheckin ? `${latestCheckin.mood}/5` : "—"} detail="今日状态" /><HealthMetric icon={Waves} label="压力" value={latestCheckin ? `${latestCheckin.stress}/5` : "—"} detail="越低越好" /><HealthMetric icon={Scale} label="体重" value={latestCheckin?.weight_kg ? `${latestCheckin.weight_kg}kg` : "—"} detail="可选记录" /></section>
    <div className="mt-8 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
      <section><div className="section-heading"><div><h2>身体趋势</h2><p>睡眠、饮水与状态变化</p></div><div className="segmented"><button className={days === 7 ? "active" : ""} onClick={() => setDays(7)} type="button">7 天</button><button className={days === 30 ? "active" : ""} onClick={() => setDays(30)} type="button">30 天</button></div></div><AnimatePresence mode="wait"><motion.div key={days} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><HealthTrends data={data} days={days} /></motion.div></AnimatePresence><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted"><span className="text-primary">■ 饮水</span><span className="text-accent">— 睡眠</span><span className="text-success">— 精力</span><span className="text-danger">— 压力</span></div></section>
      <section className="health-log-panel"><div className="section-heading"><h2>最近记录</h2><span>连续 {streak} 天</span></div><div className="mt-4 divide-y divide-border">{latestSleep ? <LogLine icon={BedDouble} title="睡眠" detail={`${formatDateTime(latestSleep.sleep_at)} 至 ${formatDateTime(latestSleep.wake_at)}`} value={`${sleepHours.toFixed(1)}h`} /> : null}{data.workoutLogs.slice(0, 3).map((item) => <LogLine key={item.id} icon={Activity} title={item.activity} detail={`${formatDateTime(item.started_at)} · 强度 ${item.intensity ?? "—"}`} value={`${item.duration_minutes}m`} />)}{latestCheckin ? <LogLine icon={BatteryCharging} title="每日状态" detail={`精力 ${latestCheckin.energy} · 心情 ${latestCheckin.mood} · 压力 ${latestCheckin.stress}`} value={latestCheckin.date.slice(5)} /> : null}{!latestSleep && !data.workoutLogs.length && !latestCheckin ? <div className="empty-panel"><HeartPulse className="size-6 text-primary" /><p>记录今天的第一个身体信号</p></div> : null}</div></section>
    </div>
    <HealthRecordDialog action={action} onOpenChange={(open) => { if (!open) setAction(null); }} spaceId={workspace.data?.spaceId} />
  </div>;
}

function HealthMetric({ icon: Icon, label, value, detail }: { icon: typeof BedDouble; label: string; value: string; detail: string }) { return <div><div className="flex items-center gap-2 text-xs text-muted"><Icon className="size-4" />{label}</div><p className="mt-3 text-xl font-medium numeric">{value}</p><p className="mt-1 text-xs text-success">{detail}</p></div>; }
function LogLine({ icon: Icon, title, detail, value }: { icon: typeof BedDouble; title: string; detail: string; value: string }) { return <div className="data-row"><span className="flex items-center gap-3"><i className="surface-icon"><Icon /></i><span><strong>{title}</strong><small>{detail}</small></span></span><b>{value}</b></div>; }
function recordStreak(data: HealthData) { const dates = new Set([...data.waterLogs.map((item) => localDateKey(new Date(item.recorded_at))), ...data.sleepLogs.map((item) => localDateKey(new Date(item.wake_at))), ...data.workoutLogs.map((item) => localDateKey(new Date(item.started_at))), ...data.dailyCheckins.map((item) => item.date)]); let count = 0; const date = new Date(); while (dates.has(localDateKey(date))) { count += 1; date.setDate(date.getDate() - 1); } return count; }
