"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { FinanceData } from "@/types/life";

const financeTables = [
  "accounts", "finance_categories", "transactions", "budgets", "recurring_expenses", "subscriptions",
  "credit_cards", "loans", "savings_goals", "purchase_plans", "salary_settings", "debt_payments",
] as const;

export function useFinance(spaceId?: string) {
  return useQuery({
    queryKey: ["finance", spaceId],
    enabled: Boolean(spaceId),
    queryFn: async (): Promise<FinanceData> => {
      const supabase = createClient();
      const results = await Promise.all(financeTables.map((table) => supabase.from(table).select("*").eq("space_id", spaceId!).order("created_at", { ascending: false })));
      const failed = results.find((result) => result.error);
      if (failed?.error) throw failed.error;
      const rows = results.map((result) => result.data ?? []);
      return {
        accounts: rows[0] as FinanceData["accounts"], categories: rows[1] as FinanceData["categories"], transactions: rows[2] as FinanceData["transactions"],
        budgets: rows[3], recurringExpenses: rows[4], subscriptions: rows[5], creditCards: rows[6], loans: rows[7], savingsGoals: rows[8], purchasePlans: rows[9],
        salarySetting: (rows[10][0] as FinanceData["salarySetting"]) ?? null, debtPayments: rows[11],
      };
    },
  });
}

export function useFinanceActions(spaceId?: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["finance", spaceId] });
  const insert = useMutation({
    mutationFn: async ({ table, values }: { table: (typeof financeTables)[number]; values: Record<string, unknown> | Record<string, unknown>[] }) => {
      if (!spaceId) throw new Error("未找到个人空间");
      const payload = Array.isArray(values) ? values.map((value) => ({ ...value, space_id: spaceId })) : { ...values, space_id: spaceId };
      const { error } = await supabase.from(table).insert(payload);
      if (error) throw error;
    },
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: async ({ table, id, values }: { table: (typeof financeTables)[number]; id: string; values: Record<string, unknown> }) => {
      if (!spaceId) throw new Error("未找到个人空间");
      const { error } = await supabase.from(table).update(values).eq("id", id).eq("space_id", spaceId);
      if (error) throw error;
    },
    onSuccess: refresh,
  });
  const upsertSalary = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (!spaceId) throw new Error("未找到个人空间");
      const { error } = await supabase.from("salary_settings").upsert({ ...values, space_id: spaceId }, { onConflict: "space_id" });
      if (error) throw error;
    },
    onSuccess: refresh,
  });
  const transfer = useMutation({
    mutationFn: async ({ fromId, toId, amount, occurredAt, note }: { fromId: string; toId: string; amount: number; occurredAt: string; note?: string }) => {
      if (!spaceId) throw new Error("未找到个人空间");
      const transferRef = crypto.randomUUID();
      const { error } = await supabase.from("transactions").insert([
        { space_id: spaceId, account_id: fromId, type: "TRANSFER", amount: -Math.abs(amount), occurred_at: occurredAt, note, transfer_ref: transferRef },
        { space_id: spaceId, account_id: toId, type: "TRANSFER", amount: Math.abs(amount), occurred_at: occurredAt, note, transfer_ref: transferRef },
      ]);
      if (error) throw error;
    },
    onSuccess: refresh,
  });
  return { insert, update, upsertSalary, transfer };
}
