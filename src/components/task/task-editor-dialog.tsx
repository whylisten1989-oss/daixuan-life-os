"use client";

import { CalendarClock, Play, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormField, FormStatus, Select, Textarea } from "@/components/forms/form-controls";
import { toDateTimeLocal } from "@/lib/date";
import type { ProjectRecord, RecurrenceFrequency, TaskArea, TaskPriority, TaskRecord, TaskStatus } from "@/types/life";
import { useTaskActions } from "@/hooks/use-tasks";

type FormState = {
  title: string; description: string; area: TaskArea; projectId: string; status: TaskStatus; priority: TaskPriority;
  scheduledAt: string; dueAt: string; estimate: string; actual: string; tags: string; recurrence: "" | RecurrenceFrequency;
  waitingFor: string; followUpAt: string;
};

const emptyState: FormState = {
  title: "", description: "", area: "LIFE", projectId: "", status: "INBOX", priority: "NONE", scheduledAt: "", dueAt: "",
  estimate: "", actual: "", tags: "", recurrence: "", waitingFor: "", followUpAt: "",
};

function stateFromTask(task?: TaskRecord | null, parent?: TaskRecord | null): FormState {
  if (!task) return { ...emptyState, parentId: undefined, area: parent?.area ?? "LIFE", projectId: parent?.project_id ?? "", status: parent ? "TODO" : "INBOX" } as FormState;
  return {
    title: task.title, description: task.description ?? "", area: task.area, projectId: task.project_id ?? "", status: task.status, priority: task.priority,
    scheduledAt: toDateTimeLocal(task.scheduled_at), dueAt: toDateTimeLocal(task.due_at), estimate: task.estimate_minutes?.toString() ?? "",
    actual: task.actual_minutes?.toString() ?? "", tags: task.tags.join("、"), recurrence: task.recurrence_rule?.frequency ?? "",
    waitingFor: task.waiting_for ?? "", followUpAt: toDateTimeLocal(task.next_follow_up_at),
  };
}

export function TaskEditorDialog({ open, onOpenChange, spaceId, projects, task, parent }: {
  open: boolean; onOpenChange: (open: boolean) => void; spaceId?: string; projects: ProjectRecord[]; task?: TaskRecord | null; parent?: TaskRecord | null;
}) {
  const actions = useTaskActions(spaceId);
  const [form, setForm] = useState<FormState>(() => stateFromTask(task, parent));
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const nextFormIdentity = open ? `${task?.id ?? "new"}:${parent?.id ?? "root"}` : "closed";
  const [formIdentity, setFormIdentity] = useState(nextFormIdentity);

  if (formIdentity !== nextFormIdentity) {
    setFormIdentity(nextFormIdentity);
    if (open) {
      setForm(stateFromTask(task, parent));
      setError("");
      setConfirmDelete(false);
    }
  }

  const handleOpenChange = (next: boolean) => { if (!next) { setForm(stateFromTask(task, parent)); setError(""); setConfirmDelete(false); } onOpenChange(next); };
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const pending = actions.save.isPending || actions.remove.isPending;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const scheduledAt = String(fields.get("scheduledAt") ?? form.scheduledAt);
    const dueAt = String(fields.get("dueAt") ?? form.dueAt);
    const followUpAt = String(fields.get("followUpAt") ?? form.followUpAt);
    if (!form.title.trim()) { setError("请填写任务标题"); return; }
    setError("");
    try {
      await actions.save.mutateAsync({
        id: task?.id,
        values: {
          title: form.title.trim(), description: form.description.trim() || null, area: form.area, project_id: form.projectId || null,
          parent_id: task?.parent_id ?? parent?.id ?? null, status: form.status, priority: form.priority,
          scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null, due_at: dueAt ? new Date(dueAt).toISOString() : null,
          estimate_minutes: form.estimate ? Number(form.estimate) : null, actual_minutes: form.actual ? Number(form.actual) : null,
          tags: form.tags.split(/[、,，]/).map((tag) => tag.trim()).filter(Boolean), recurrence_rule: form.recurrence ? { frequency: form.recurrence } : null,
          waiting_for: form.waitingFor.trim() || null, next_follow_up_at: followUpAt ? new Date(followUpAt).toISOString() : null,
        },
      });
      handleOpenChange(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "保存失败"); }
  };

  const remove = async () => {
    if (!task) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    try { await actions.remove.mutateAsync(task.id); handleOpenChange(false); } catch (cause) { setError(cause instanceof Error ? cause.message : "删除失败"); }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:w-[min(92vw,760px)]">
        <DialogHeader>
          <DialogTitle>{parent ? `添加子任务 · ${parent.title}` : task ? "任务详情" : "新建任务"}</DialogTitle>
          <DialogDescription>时间可选；未安排具体时间的任务会留在今日清单，不会进入时间轴。</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit}>
          <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6">
            <FormField label="标题" className="sm:col-span-2"><Input autoFocus value={form.title} onChange={(event) => set("title", event.target.value)} placeholder="下一步要完成什么" /></FormField>
            <FormField label="描述" className="sm:col-span-2"><Textarea value={form.description} onChange={(event) => set("description", event.target.value)} placeholder="补充完成标准、上下文或链接" /></FormField>
            <FormField label="领域"><Select value={form.area} onChange={(event) => set("area", event.target.value as TaskArea)}><option value="WORK">工作</option><option value="LIFE">生活</option></Select></FormField>
            <FormField label="状态"><Select value={form.status} onChange={(event) => set("status", event.target.value as TaskStatus)}><option value="INBOX">收集箱</option><option value="PLANNED">已计划</option><option value="TODO">待完成</option><option value="IN_PROGRESS">进行中</option><option value="WAITING">待跟进</option><option value="COMPLETED">已完成</option><option value="CANCELLED">已取消</option></Select></FormField>
            <FormField label="项目"><Select value={form.projectId} onChange={(event) => set("projectId", event.target.value)}><option value="">无项目</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</Select></FormField>
            <FormField label="优先级"><Select value={form.priority} onChange={(event) => set("priority", event.target.value as TaskPriority)}><option value="NONE">无</option><option value="LOW">低</option><option value="MEDIUM">中</option><option value="HIGH">高</option><option value="URGENT">紧急</option></Select></FormField>
            <FormField label="计划开始"><Input name="scheduledAt" type="datetime-local" value={form.scheduledAt} onChange={(event) => set("scheduledAt", event.target.value)} /></FormField>
            <FormField label="截止时间"><Input name="dueAt" type="datetime-local" value={form.dueAt} onChange={(event) => set("dueAt", event.target.value)} /></FormField>
            <FormField label="预计用时（分钟）"><Input type="number" min="1" inputMode="numeric" value={form.estimate} onChange={(event) => set("estimate", event.target.value)} /></FormField>
            <FormField label="实际用时（分钟）"><Input type="number" min="0" inputMode="numeric" value={form.actual} onChange={(event) => set("actual", event.target.value)} /></FormField>
            <FormField label="循环"><Select value={form.recurrence} onChange={(event) => set("recurrence", event.target.value as FormState["recurrence"])}><option value="">不循环</option><option value="DAILY">每天</option><option value="WEEKLY">每周</option><option value="MONTHLY">每月</option></Select></FormField>
            <FormField label="标签"><Input value={form.tags} onChange={(event) => set("tags", event.target.value)} placeholder="用逗号分隔" /></FormField>
            <FormField label="等待对象"><Input value={form.waitingFor} onChange={(event) => set("waitingFor", event.target.value)} placeholder="人员或外部事项" /></FormField>
            <FormField label="下次跟进"><Input name="followUpAt" type="datetime-local" value={form.followUpAt} onChange={(event) => set("followUpAt", event.target.value)} /></FormField>
            <FormStatus danger>{error}</FormStatus>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row sm:items-center">
            {task ? <Button className="sm:mr-auto" type="button" variant={confirmDelete ? "danger" : "ghost"} onClick={remove}><Trash2 data-icon="inline-start" />{confirmDelete ? "再次点击确认删除" : "删除"}</Button> : null}
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>取消</Button>
            <Button type="submit" disabled={pending}>{pending ? "保存中…" : "保存任务"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TaskRunControls({ task, spaceId }: { task: TaskRecord; spaceId?: string }) {
  const { update } = useTaskActions(spaceId);
  if (task.status === "COMPLETED") return <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: task.id, values: { status: "TODO", completed_at: null, ended_at: null } })}><RotateCcw data-icon="inline-start" />恢复</Button>;
  if (!task.started_at) return <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: task.id, values: { status: "IN_PROGRESS", started_at: new Date().toISOString() } })}><Play data-icon="inline-start" />开始</Button>;
  return <span className="flex items-center gap-1 text-xs text-accent"><CalendarClock className="size-3.5" />进行中</span>;
}
