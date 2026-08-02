"use client";

import { CalendarClock, Check, ChevronDown, Circle, Filter, ListChecks, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { todayTasks } from "@/data/demo";
import { useUiStore } from "@/store/ui-store";
import { ModuleHeader } from "./module-header";

const taskViews = ["Inbox", "今日任务", "全部任务", "项目", "等待中", "逾期", "循环任务", "已完成"];

export function TasksScreen() {
  const [view, setView] = useState("今日任务");
  const [query, setQuery] = useState("");
  const [done, setDone] = useState(new Set(todayTasks.filter((task) => task.status === "done").map((task) => task.id)));
  const setQuickCreateOpen = useUiStore((state) => state.setQuickCreateOpen);
  const filtered = useMemo(() => todayTasks.filter((task) => task.title.includes(query)), [query]);

  const toggle = (id: string) => setDone((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  return (
    <div className="mx-auto max-w-[1380px] px-4 py-7 sm:px-6 lg:px-8">
      <ModuleHeader icon={ListChecks} title="任务中心" description="从收集到完成，所有行动保持可追踪。" action={<Button onClick={() => setQuickCreateOpen(true)}><Plus data-icon="inline-start" />新建任务</Button>} />
      <div className="mt-6 flex gap-2 overflow-x-auto border-b border-border pb-3 scrollbar-none">
        {taskViews.map((item) => <button key={item} type="button" onClick={() => setView(item)} className={`min-h-9 shrink-0 border-b-2 px-2 text-sm ${view === item ? "border-primary text-foreground" : "border-transparent text-muted"}`}>{item}</button>)}
      </div>
      <div className="mt-5 grid gap-6 xl:grid-cols-[1fr_280px]">
        <section className="min-w-0">
          <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row">
            <label className="relative flex-1"><Search aria-hidden="true" className="absolute left-3 top-3.5 size-4 text-subtle" /><Input className="pl-9" placeholder="搜索任务" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            <Button variant="outline"><Filter data-icon="inline-start" />筛选</Button>
            <Button variant="outline">按时间 <ChevronDown data-icon="inline-end" /></Button>
          </div>
          <ul className="divide-y divide-border">
            {filtered.map((task) => (
              <li key={task.id} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 py-4 sm:grid-cols-[32px_minmax(0,1fr)_130px_100px] sm:items-center">
                <button aria-label={done.has(task.id) ? `撤销完成 ${task.title}` : `完成 ${task.title}`} type="button" onClick={() => toggle(task.id)} className="flex size-6 items-center justify-center rounded-full border border-line-strong text-success">{done.has(task.id) ? <Check className="size-3.5" /> : <Circle className="size-2" />}</button>
                <div className="min-w-0"><p className={`truncate text-sm font-medium ${done.has(task.id) ? "text-muted line-through" : ""}`}>{task.title}</p><p className="mt-1 truncate text-xs text-muted">{task.detail}</p></div>
                <div className="col-start-2 text-xs text-muted sm:col-auto"><CalendarClock className="mr-1 inline size-3.5" />{task.time}–{task.endTime}</div>
                <Badge className="col-start-2 w-fit sm:col-auto">{task.category}</Badge>
              </li>
            ))}
          </ul>
        </section>
        <aside className="border-l border-border pl-5">
          <h2 className="text-sm font-semibold">今日负载</h2>
          <div className="mt-4 flex items-end gap-2"><span className="text-4xl font-medium numeric">6.4</span><span className="pb-1 text-sm text-muted">小时已安排</span></div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-sunken"><div className="h-full w-[72%] bg-primary" /></div>
          <dl className="mt-5 flex flex-col gap-3 text-sm"><div className="flex justify-between"><dt className="text-muted">已完成</dt><dd>{done.size}</dd></div><div className="flex justify-between"><dt className="text-muted">预计用时</dt><dd>7h 15m</dd></div><div className="flex justify-between"><dt className="text-muted">等待中</dt><dd>1</dd></div><div className="flex justify-between"><dt className="text-muted">逾期</dt><dd className="text-danger">1</dd></div></dl>
        </aside>
      </div>
    </div>
  );
}
