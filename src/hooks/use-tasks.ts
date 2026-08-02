"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToDate } from "@/lib/date";
import { createClient } from "@/lib/supabase/client";
import type { ProjectRecord, RecurrenceFrequency, TaskRecord } from "@/types/life";

export type TaskInput = Omit<Partial<TaskRecord>, "id" | "space_id" | "created_at" | "updated_at"> & { title: string };

export function useTasks(spaceId?: string) {
  return useQuery({
    queryKey: ["tasks", spaceId],
    enabled: Boolean(spaceId),
    queryFn: async () => {
      const { data, error } = await createClient().from("tasks").select("*").eq("space_id", spaceId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data as TaskRecord[];
    },
  });
}

export function useProjects(spaceId?: string) {
  return useQuery({
    queryKey: ["projects", spaceId],
    enabled: Boolean(spaceId),
    queryFn: async () => {
      const { data, error } = await createClient().from("projects").select("*").eq("space_id", spaceId!).order("created_at");
      if (error) throw error;
      return data as ProjectRecord[];
    },
  });
}

function nextRecurringTask(task: TaskRecord) {
  const frequency = task.recurrence_rule?.frequency as RecurrenceFrequency | undefined;
  if (!frequency) return null;
  const unit = frequency === "DAILY" ? "day" : frequency === "WEEKLY" ? "week" : "month";
  return {
    space_id: task.space_id,
    project_id: task.project_id,
    parent_id: task.parent_id,
    title: task.title,
    description: task.description,
    area: task.area,
    status: "PLANNED",
    priority: task.priority,
    due_at: task.due_at ? addToDate(task.due_at, 1, unit) : null,
    scheduled_at: task.scheduled_at ? addToDate(task.scheduled_at, 1, unit) : null,
    estimate_minutes: task.estimate_minutes,
    recurrence_rule: task.recurrence_rule,
    tags: task.tags,
    waiting_for: task.waiting_for,
    next_follow_up_at: task.next_follow_up_at ? addToDate(task.next_follow_up_at, 1, unit) : null,
  };
}

export function useTaskActions(spaceId?: string) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["tasks", spaceId] });
  const supabase = createClient();

  const save = useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: TaskInput }) => {
      if (!spaceId) throw new Error("未找到个人空间");
      const query = id
        ? supabase.from("tasks").update(values).eq("id", id).eq("space_id", spaceId)
        : supabase.from("tasks").insert({ ...values, space_id: spaceId });
      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<TaskRecord> }) => {
      if (!spaceId) throw new Error("未找到个人空间");
      const { error } = await supabase.from("tasks").update(values).eq("id", id).eq("space_id", spaceId);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const complete = useMutation({
    mutationFn: async (task: TaskRecord) => {
      const now = new Date().toISOString();
      const actualMinutes = task.started_at ? Math.max(1, Math.round((Date.now() - new Date(task.started_at).getTime()) / 60000)) : task.actual_minutes;
      const { error } = await supabase.from("tasks").update({ status: "COMPLETED", completed_at: now, ended_at: now, actual_minutes: actualMinutes }).eq("id", task.id).eq("space_id", task.space_id);
      if (error) throw error;
      const nextTask = nextRecurringTask(task);
      if (nextTask) {
        const { error: recurrenceError } = await supabase.from("tasks").insert(nextTask);
        if (recurrenceError) throw recurrenceError;
      }
    },
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (!spaceId) throw new Error("未找到个人空间");
      const { error } = await supabase.from("tasks").delete().eq("id", id).eq("space_id", spaceId);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const addProject = useMutation({
    mutationFn: async (name: string) => {
      if (!spaceId) throw new Error("未找到个人空间");
      const { error } = await supabase.from("projects").insert({ space_id: spaceId, name });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects", spaceId] }),
  });

  return { save, update, complete, remove, addProject };
}
