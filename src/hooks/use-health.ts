"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { HealthData } from "@/types/life";

const healthTables = ["sleep_logs", "water_logs", "workout_logs", "daily_checkins", "health_goals"] as const;

export function useHealth(spaceId?: string) {
  return useQuery({
    queryKey: ["health", spaceId],
    enabled: Boolean(spaceId),
    queryFn: async (): Promise<HealthData> => {
      const results = await Promise.all(healthTables.map((table) => createClient().from(table).select("*").eq("space_id", spaceId!).order("created_at", { ascending: false }).limit(120)));
      const failed = results.find((result) => result.error);
      if (failed?.error) throw failed.error;
      return {
        sleepLogs: (results[0].data ?? []) as HealthData["sleepLogs"], waterLogs: (results[1].data ?? []) as HealthData["waterLogs"],
        workoutLogs: (results[2].data ?? []) as HealthData["workoutLogs"], dailyCheckins: (results[3].data ?? []) as HealthData["dailyCheckins"], goals: results[4].data ?? [],
      };
    },
  });
}

export function useHealthActions(spaceId?: string) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["health", spaceId] });
  const save = useMutation({
    mutationFn: async ({ table, values, upsert }: { table: (typeof healthTables)[number]; values: Record<string, unknown>; upsert?: boolean }) => {
      if (!spaceId) throw new Error("未找到个人空间");
      const query = upsert
        ? createClient().from(table).upsert({ ...values, space_id: spaceId }, { onConflict: table === "daily_checkins" ? "space_id,date" : undefined })
        : createClient().from(table).insert({ ...values, space_id: spaceId });
      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: refresh,
  });
  return { save };
}
