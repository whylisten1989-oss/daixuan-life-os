"use client";

import { AnimatePresence, motion } from "motion/react";
import { CalendarClock, Check, ChevronRight, Circle, Clock3, FolderKanban, ListChecks, Plus, Search, UserRoundCheck } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { Select } from "@/components/forms/form-controls";
import { TaskEditorDialog, TaskRunControls } from "@/components/task/task-editor-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjects, useTaskActions, useTasks } from "@/hooks/use-tasks";
import { useWorkspace } from "@/hooks/use-workspace";
import { formatDateTime, isToday } from "@/lib/date";
import type { TaskPriority, TaskRecord } from "@/types/life";
import { ModuleHeader } from "./module-header";

const taskViews = ["收集箱", "今日", "工作", "生活", "项目", "待跟进", "逾期", "日历", "已完成"] as const;
const priorityLabel: Record<TaskPriority, string> = { NONE: "无", LOW: "低", MEDIUM: "中", HIGH: "高", URGENT: "紧急" };

function matchesView(task: TaskRecord, view: (typeof taskViews)[number]) {
  if (view === "收集箱") return task.status === "INBOX";
  if (view === "今日") return task.status !== "COMPLETED" && task.status !== "CANCELLED" && (isToday(task.due_at) || isToday(task.scheduled_at));
  if (view === "工作") return task.area === "WORK" && task.status !== "COMPLETED" && task.status !== "CANCELLED";
  if (view === "生活") return task.area === "LIFE" && task.status !== "COMPLETED" && task.status !== "CANCELLED";
  if (view === "待跟进") return task.status === "WAITING" || Boolean(task.waiting_for || task.next_follow_up_at);
  if (view === "逾期") return task.status !== "COMPLETED" && Boolean(task.due_at && new Date(task.due_at) < new Date());
  if (view === "已完成") return task.status === "COMPLETED";
  return task.status !== "CANCELLED";
}

export function TasksScreen() {
  const workspace = useWorkspace();
  const tasksQuery = useTasks(workspace.data?.spaceId);
  const projectsQuery = useProjects(workspace.data?.spaceId);
  const actions = useTaskActions(workspace.data?.spaceId);
  const [view, setView] = useState<(typeof taskViews)[number]>("今日");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const [priority, setPriority] = useState<TaskPriority | "ALL">("ALL");
  const [projectId, setProjectId] = useState("ALL");
  const [editorOpen, setEditorOpen] = useState(false);
  const [selected, setSelected] = useState<TaskRecord | null>(null);
  const [parent, setParent] = useState<TaskRecord | null>(null);
  const [projectName, setProjectName] = useState("");
  const tasks = useMemo(() => tasksQuery.data ?? [], [tasksQuery.data]);
  const projects = projectsQuery.data ?? [];

  const filtered = useMemo(() => tasks.filter((task) => {
    const searchMatch = !deferredQuery || `${task.title} ${task.description ?? ""} ${task.tags.join(" ")}`.toLowerCase().includes(deferredQuery);
    return !task.parent_id && matchesView(task, view) && searchMatch && (priority === "ALL" || task.priority === priority) && (projectId === "ALL" || task.project_id === projectId);
  }).sort((a, b) => Number(a.status === "COMPLETED") - Number(b.status === "COMPLETED") || (a.due_at ?? "9999").localeCompare(b.due_at ?? "9999")), [tasks, deferredQuery, view, priority, projectId]);

  const openNew = () => { setSelected(null); setParent(null); setEditorOpen(true); };
  const openTask = (task: TaskRecord) => { setSelected(task); setParent(null); setEditorOpen(true); };
  const openSubtask = (task: TaskRecord) => { setSelected(null); setParent(task); setEditorOpen(true); };
  const empty = !tasksQuery.isLoading && filtered.length === 0;
  const totalEstimate = filtered.reduce((sum, task) => sum + (task.estimate_minutes ?? 0), 0);
  const totalActual = filtered.reduce((sum, task) => sum + (task.actual_minutes ?? 0), 0);

  return (
    <div className="app-page">
      <ModuleHeader icon={ListChecks} title="任务中心" description="把进入系统的事情变成有边界、可跟进的下一步。" action={<Button onClick={openNew}><Plus data-icon="inline-start" />新建任务</Button>} />
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-border scrollbar-none" aria-label="任务视图">
        {taskViews.map((item) => <button key={item} type="button" onClick={() => setView(item)} className={`min-h-11 shrink-0 border-b-2 px-3 text-sm transition-colors ${view === item ? "border-primary text-foreground" : "border-transparent text-muted hover:text-foreground"}`}>{item}</button>)}
      </div>

      <div className="mt-5 grid gap-7 xl:grid-cols-[minmax(0,1fr)_264px]">
        <section className="min-w-0">
          <div className="grid gap-3 border-b border-border pb-4 sm:grid-cols-[minmax(220px,1fr)_150px_180px]">
            <label className="relative"><Search aria-hidden="true" className="absolute left-3 top-3.5 size-4 text-subtle" /><Input className="pl-9" placeholder="搜索标题、描述或标签" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            <Select aria-label="按优先级筛选" value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority | "ALL")}><option value="ALL">全部优先级</option>{Object.entries(priorityLabel).map(([value, label]) => <option key={value} value={value}>{label}优先级</option>)}</Select>
            <Select aria-label="按项目筛选" value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="ALL">全部项目</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</Select>
          </div>

          {tasksQuery.isLoading ? <TaskLoading /> : null}
          {tasksQuery.error ? <div className="empty-panel text-danger">任务加载失败：{tasksQuery.error.message}</div> : null}
          {empty ? <div className="empty-panel"><ListChecks className="size-7 text-primary" /><h2>这个视图暂时为空</h2><p>从一个明确、能在今天推进的动作开始。</p><Button variant="outline" onClick={openNew}>创建任务</Button></div> : null}

          <motion.ul layout className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {filtered.map((task) => {
                const subtasks = tasks.filter((candidate) => candidate.parent_id === task.id);
                const completedSubtasks = subtasks.filter((candidate) => candidate.status === "COMPLETED").length;
                return (
                  <motion.li layout key={task.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="task-row group">
                    <button aria-label={task.status === "COMPLETED" ? `恢复 ${task.title}` : `完成 ${task.title}`} onClick={() => task.status === "COMPLETED" ? actions.update.mutate({ id: task.id, values: { status: "TODO", completed_at: null, ended_at: null } }) : actions.complete.mutate(task)} className="task-check" type="button">{task.status === "COMPLETED" ? <Check className="size-3.5" /> : <Circle className="size-2" />}</button>
                    <button className="min-w-0 text-left" onClick={() => openTask(task)} type="button">
                      <div className="flex flex-wrap items-center gap-2"><span className={`text-sm font-medium ${task.status === "COMPLETED" ? "text-muted line-through" : ""}`}>{task.title}</span><Badge className={task.area === "WORK" ? "border-accent/35 text-accent" : "border-primary/35 text-primary"}>{task.area === "WORK" ? "工作" : "生活"}</Badge>{task.priority !== "NONE" ? <span className="text-[11px] text-danger">{priorityLabel[task.priority]}</span> : null}</div>
                      <p className="mt-1 line-clamp-1 text-xs text-muted">{task.description || task.waiting_for || "点击补充描述与完成标准"}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-subtle">
                        {task.scheduled_at ? <span><CalendarClock className="mr-1 inline size-3" />{formatDateTime(task.scheduled_at)}</span> : null}
                        {task.due_at ? <span className={new Date(task.due_at) < new Date() && task.status !== "COMPLETED" ? "text-danger" : ""}>截止 {formatDateTime(task.due_at)}</span> : null}
                        {task.estimate_minutes ? <span>预计 {task.estimate_minutes} 分钟</span> : null}
                        {subtasks.length ? <span>{completedSubtasks}/{subtasks.length} 子任务</span> : null}
                        {task.recurrence_rule?.frequency ? <span>循环</span> : null}
                      </div>
                    </button>
                    <div className="flex items-center justify-end gap-1"><TaskRunControls task={task} spaceId={workspace.data?.spaceId} /><Button size="icon" variant="ghost" aria-label={`添加 ${task.title} 的子任务`} onClick={() => openSubtask(task)}><Plus /></Button><Button size="icon" variant="ghost" aria-label={`打开 ${task.title}`} onClick={() => openTask(task)}><ChevronRight /></Button></div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
        </section>

        <aside className="space-y-7 xl:border-l xl:border-border xl:pl-6">
          <section><div className="flex items-center gap-2 text-sm font-semibold"><Clock3 className="size-4 text-primary" />当前视图负载</div><div className="mt-4 flex items-end gap-2"><span className="text-4xl font-medium numeric">{(totalEstimate / 60).toFixed(1)}</span><span className="pb-1 text-sm text-muted">预计小时</span></div><dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><dt className="text-muted">实际用时</dt><dd>{Math.round(totalActual / 60 * 10) / 10} 小时</dd></div><div className="flex justify-between"><dt className="text-muted">待跟进</dt><dd>{tasks.filter((task) => task.status === "WAITING").length}</dd></div><div className="flex justify-between"><dt className="text-muted">逾期</dt><dd className="text-danger">{tasks.filter((task) => task.due_at && new Date(task.due_at) < new Date() && task.status !== "COMPLETED").length}</dd></div></dl></section>
          <section className="border-t border-border pt-6"><div className="flex items-center gap-2 text-sm font-semibold"><FolderKanban className="size-4 text-accent" />项目</div><div className="mt-3 flex gap-2"><Input placeholder="新项目名称" value={projectName} onChange={(event) => setProjectName(event.target.value)} /><Button size="icon" variant="outline" aria-label="创建项目" disabled={!projectName.trim()} onClick={async () => { await actions.addProject.mutateAsync(projectName.trim()); setProjectName(""); }}><Plus /></Button></div><ul className="mt-3 space-y-2 text-sm text-muted">{projects.map((project) => <li key={project.id} className="flex justify-between"><span>{project.name}</span><span>{tasks.filter((task) => task.project_id === project.id && task.status !== "COMPLETED").length}</span></li>)}</ul></section>
          <section className="border-t border-border pt-6 text-xs text-muted"><div className="flex items-center gap-2 font-medium text-foreground"><UserRoundCheck className="size-4 text-primary" />待跟进规则</div><p className="mt-2 leading-5">设置等待对象或下次跟进时间后，任务会出现在“待跟进”视图。</p></section>
        </aside>
      </div>

      <TaskEditorDialog key={selected?.id ?? parent?.id ?? "new"} open={editorOpen} onOpenChange={setEditorOpen} spaceId={workspace.data?.spaceId} projects={projects} task={selected} parent={parent} />
    </div>
  );
}

function TaskLoading() { return <div className="space-y-1 py-3" aria-label="任务加载中">{[0, 1, 2].map((item) => <div key={item} className="h-20 animate-pulse border-b border-border bg-surface-raised/50" />)}</div>; }
