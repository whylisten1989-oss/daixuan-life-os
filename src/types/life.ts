export type TaskStatus = "INBOX" | "PLANNED" | "TODO" | "IN_PROGRESS" | "WAITING" | "COMPLETED" | "CANCELLED";
export type TaskPriority = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskArea = "WORK" | "LIFE";
export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export type ProjectRecord = {
  id: string;
  space_id: string;
  name: string;
  description: string | null;
  color: string;
  status: string;
  target_date: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskRecord = {
  id: string;
  space_id: string;
  project_id: string | null;
  parent_id: string | null;
  title: string;
  description: string | null;
  area: TaskArea;
  status: TaskStatus;
  priority: TaskPriority;
  due_at: string | null;
  scheduled_at: string | null;
  estimate_minutes: number | null;
  actual_minutes: number | null;
  recurrence_rule: { frequency?: RecurrenceFrequency } | null;
  tags: string[];
  waiting_for: string | null;
  next_follow_up_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Workspace = {
  userId: string;
  email: string;
  displayName: string;
  timezone: string;
  spaceId: string;
  spaceName: string;
  role: string;
};

export type AccountRecord = {
  id: string;
  space_id: string;
  name: string;
  type: "CASH" | "CHECKING" | "SAVINGS" | "WECHAT" | "ALIPAY" | "CREDIT_CARD" | "LOAN" | "INVESTMENT" | "CUSTOM" | "OTHER";
  currency: string;
  opening_balance: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export type FinanceCategoryRecord = {
  id: string;
  space_id: string;
  name: string;
  kind: "INCOME" | "EXPENSE" | "TRANSFER";
  color: string;
  created_at: string;
};

export type TransactionRecord = {
  id: string;
  space_id: string;
  account_id: string;
  category_id: string | null;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: number;
  occurred_at: string;
  merchant: string | null;
  note: string | null;
  transfer_ref: string | null;
  created_at: string;
  updated_at: string;
};

export type SalarySettingRecord = {
  id: string;
  space_id: string;
  account_id: string;
  amount: number;
  pay_day: number;
  is_active: boolean;
  last_received_month: string | null;
  last_received_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FinanceData = {
  accounts: AccountRecord[];
  categories: FinanceCategoryRecord[];
  transactions: TransactionRecord[];
  budgets: Record<string, unknown>[];
  recurringExpenses: Record<string, unknown>[];
  subscriptions: Record<string, unknown>[];
  creditCards: Record<string, unknown>[];
  loans: Record<string, unknown>[];
  savingsGoals: Record<string, unknown>[];
  purchasePlans: Record<string, unknown>[];
  salarySetting: SalarySettingRecord | null;
  debtPayments: Record<string, unknown>[];
};

export type SleepLogRecord = {
  id: string;
  space_id: string;
  sleep_at: string;
  wake_at: string;
  quality: number | null;
  note: string | null;
  created_at: string;
};

export type WaterLogRecord = { id: string; space_id: string; amount_ml: number; recorded_at: string; created_at: string };
export type WorkoutLogRecord = {
  id: string;
  space_id: string;
  activity: string;
  duration_minutes: number;
  intensity: number | null;
  calories: number | null;
  steps: number | null;
  feeling: number | null;
  started_at: string;
  note: string | null;
  created_at: string;
};
export type DailyCheckinRecord = {
  id: string;
  space_id: string;
  date: string;
  energy: number;
  mood: number;
  stress: number;
  steps: number | null;
  weight_kg: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type HealthData = {
  sleepLogs: SleepLogRecord[];
  waterLogs: WaterLogRecord[];
  workoutLogs: WorkoutLogRecord[];
  dailyCheckins: DailyCheckinRecord[];
  goals: Record<string, unknown>[];
};
