"use client";

import { useState } from "react";
import { FormField, FormStatus, Select, Textarea } from "@/components/forms/form-controls";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useHealthActions } from "@/hooks/use-health";
import { localDateKey } from "@/lib/date";

export type HealthAction = "water" | "sleep" | "workout" | "checkin";
const titles: Record<HealthAction, string> = { water: "自定义饮水", sleep: "记录睡眠", workout: "记录运动", checkin: "记录今日状态" };
const read = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const readNumber = (form: FormData, key: string) => Number(read(form, key));

export function HealthRecordDialog({ action, onOpenChange, spaceId }: { action: HealthAction | null; onOpenChange: (open: boolean) => void; spaceId?: string }) {
  const { save } = useHealthActions(spaceId);
  const [error, setError] = useState("");
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!action) return;
    const form = new FormData(event.currentTarget); setError("");
    try {
      if (action === "water") await save.mutateAsync({ table: "water_logs", values: { amount_ml: readNumber(form, "amount"), recorded_at: new Date().toISOString() } });
      if (action === "sleep") {
        const sleepAt = new Date(read(form, "sleepAt")); const wakeAt = new Date(read(form, "wakeAt"));
        if (wakeAt <= sleepAt) throw new Error("起床时间必须晚于入睡时间");
        await save.mutateAsync({ table: "sleep_logs", values: { sleep_at: sleepAt.toISOString(), wake_at: wakeAt.toISOString(), quality: readNumber(form, "quality"), note: read(form, "note") || null } });
      }
      if (action === "workout") await save.mutateAsync({ table: "workout_logs", values: { activity: read(form, "activity"), started_at: new Date(read(form, "startedAt")).toISOString(), duration_minutes: readNumber(form, "duration"), intensity: readNumber(form, "intensity"), steps: read(form, "steps") ? readNumber(form, "steps") : null, calories: read(form, "calories") ? readNumber(form, "calories") : null, feeling: readNumber(form, "feeling"), note: read(form, "note") || null } });
      if (action === "checkin") await save.mutateAsync({ table: "daily_checkins", upsert: true, values: { date: read(form, "date"), energy: readNumber(form, "energy"), mood: readNumber(form, "mood"), stress: readNumber(form, "stress"), steps: read(form, "steps") ? readNumber(form, "steps") : null, weight_kg: read(form, "weight") ? readNumber(form, "weight") : null, note: read(form, "note") || null } });
      onOpenChange(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "保存失败"); }
  };
  return <Dialog open={Boolean(action)} onOpenChange={onOpenChange}><DialogContent className="max-h-[92vh] overflow-y-auto"><DialogHeader><DialogTitle>{action ? titles[action] : "健康记录"}</DialogTitle><DialogDescription>记录身体信号，用连续趋势观察变化。</DialogDescription></DialogHeader>{action ? <form onSubmit={submit}><div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6"><Fields action={action} /><FormStatus danger>{error}</FormStatus></div><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>取消</Button><Button type="submit" disabled={save.isPending}>{save.isPending ? "保存中…" : "保存记录"}</Button></DialogFooter></form> : null}</DialogContent></Dialog>;
}

function Fields({ action }: { action: HealthAction }) {
  const now = new Date(); const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  if (action === "water") return <FormField label="饮水量（ml）" className="sm:col-span-2"><Input name="amount" type="number" min="50" max="3000" step="50" defaultValue="350" required /></FormField>;
  if (action === "sleep") { const wake = local; const sleep = new Date(now.getTime() - 8 * 3600000 - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16); return <><FormField label="入睡时间"><Input name="sleepAt" type="datetime-local" defaultValue={sleep} required /></FormField><FormField label="起床时间"><Input name="wakeAt" type="datetime-local" defaultValue={wake} required /></FormField><FormField label="睡眠质量"><Select name="quality" defaultValue="3"><option value="1">1 · 很差</option><option value="2">2 · 较差</option><option value="3">3 · 一般</option><option value="4">4 · 良好</option><option value="5">5 · 很好</option></Select></FormField><FormField label="备注" className="sm:col-span-2"><Textarea name="note" placeholder="夜间醒来、入睡困难等" /></FormField></>; }
  if (action === "workout") return <><FormField label="运动类型"><Input name="activity" placeholder="跑步、力量训练、游泳…" required /></FormField><FormField label="开始时间"><Input name="startedAt" type="datetime-local" defaultValue={local} required /></FormField><FormField label="时长（分钟）"><Input name="duration" type="number" min="1" defaultValue="30" required /></FormField><FormField label="强度"><Select name="intensity" defaultValue="3"><option value="1">1 · 轻松</option><option value="2">2 · 轻度</option><option value="3">3 · 中等</option><option value="4">4 · 较强</option><option value="5">5 · 高强度</option></Select></FormField><FormField label="步数（可选）"><Input name="steps" type="number" min="0" /></FormField><FormField label="热量 kcal（可选）"><Input name="calories" type="number" min="0" /></FormField><FormField label="运动后感受"><Select name="feeling" defaultValue="4"><option value="1">1 · 很差</option><option value="2">2 · 疲惫</option><option value="3">3 · 一般</option><option value="4">4 · 舒服</option><option value="5">5 · 很好</option></Select></FormField><FormField label="备注" className="sm:col-span-2"><Textarea name="note" /></FormField></>;
  return <><FormField label="日期"><Input name="date" type="date" defaultValue={localDateKey()} required /></FormField><Scale name="energy" label="精力" /><Scale name="mood" label="心情" /><Scale name="stress" label="压力" /><FormField label="步数（可选）"><Input name="steps" type="number" min="0" /></FormField><FormField label="体重 kg（可选）"><Input name="weight" type="number" min="20" max="300" step="0.1" /></FormField><FormField label="备注" className="sm:col-span-2"><Textarea name="note" placeholder="记录影响今天状态的因素" /></FormField></>;
}
function Scale({ name, label }: { name: string; label: string }) { return <FormField label={`${label} 1–5`}><Select name={name} defaultValue="3"><option value="1">1 · 很低</option><option value="2">2 · 较低</option><option value="3">3 · 一般</option><option value="4">4 · 良好</option><option value="5">5 · 很好</option></Select></FormField>; }
