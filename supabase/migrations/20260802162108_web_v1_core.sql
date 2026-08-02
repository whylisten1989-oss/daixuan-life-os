-- Daixuan Life OS Web V1: additive fields and records only.
-- Existing identity, space membership and RLS policies remain intact.

ALTER TYPE public."TaskStatus" ADD VALUE IF NOT EXISTS 'PLANNED' AFTER 'INBOX';
ALTER TYPE public."AccountType" ADD VALUE IF NOT EXISTS 'WECHAT' AFTER 'SAVINGS';
ALTER TYPE public."AccountType" ADD VALUE IF NOT EXISTS 'ALIPAY' AFTER 'WECHAT';
ALTER TYPE public."AccountType" ADD VALUE IF NOT EXISTS 'CUSTOM' BEFORE 'OTHER';

CREATE TYPE public."TaskArea" AS ENUM ('WORK', 'LIFE');
CREATE TYPE public."DebtPaymentKind" AS ENUM ('CREDIT_CARD', 'LOAN');

ALTER TABLE public.tasks
  ADD COLUMN area public."TaskArea" NOT NULL DEFAULT 'LIFE',
  ADD COLUMN tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN next_follow_up_at timestamptz(6),
  ADD COLUMN started_at timestamptz(6),
  ADD COLUMN ended_at timestamptz(6);

ALTER TABLE public.workout_logs
  ADD COLUMN steps integer,
  ADD COLUMN feeling integer;

ALTER TABLE public.daily_checkins
  ADD COLUMN steps integer,
  ADD COLUMN weight_kg numeric(6, 2);

ALTER TABLE public.sleep_logs
  ADD CONSTRAINT sleep_logs_quality_check CHECK (quality IS NULL OR quality BETWEEN 1 AND 5),
  ADD CONSTRAINT sleep_logs_time_check CHECK (wake_at > sleep_at);

ALTER TABLE public.workout_logs
  ADD CONSTRAINT workout_logs_duration_check CHECK (duration_minutes > 0),
  ADD CONSTRAINT workout_logs_intensity_check CHECK (intensity IS NULL OR intensity BETWEEN 1 AND 5),
  ADD CONSTRAINT workout_logs_feeling_check CHECK (feeling IS NULL OR feeling BETWEEN 1 AND 5),
  ADD CONSTRAINT workout_logs_steps_check CHECK (steps IS NULL OR steps >= 0);

ALTER TABLE public.daily_checkins
  ADD CONSTRAINT daily_checkins_energy_check CHECK (energy BETWEEN 1 AND 5),
  ADD CONSTRAINT daily_checkins_mood_check CHECK (mood BETWEEN 1 AND 5),
  ADD CONSTRAINT daily_checkins_stress_check CHECK (stress BETWEEN 1 AND 5),
  ADD CONSTRAINT daily_checkins_steps_check CHECK (steps IS NULL OR steps >= 0),
  ADD CONSTRAINT daily_checkins_weight_check CHECK (weight_kg IS NULL OR weight_kg > 0);

CREATE TABLE public.salary_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL UNIQUE REFERENCES public.spaces(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  amount numeric(14, 2) NOT NULL CHECK (amount > 0),
  pay_day integer NOT NULL CHECK (pay_day BETWEEN 1 AND 31),
  is_active boolean NOT NULL DEFAULT true,
  last_received_month date,
  last_received_at timestamptz(6),
  created_at timestamptz(6) NOT NULL DEFAULT now(),
  updated_at timestamptz(6) NOT NULL DEFAULT now()
);

CREATE TABLE public.debt_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  from_account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  kind public."DebtPaymentKind" NOT NULL,
  amount numeric(14, 2) NOT NULL CHECK (amount > 0),
  paid_at timestamptz(6) NOT NULL DEFAULT now(),
  note text,
  created_at timestamptz(6) NOT NULL DEFAULT now(),
  CONSTRAINT debt_payments_distinct_accounts CHECK (account_id <> from_account_id)
);

CREATE INDEX tasks_space_id_area_status_idx ON public.tasks(space_id, area, status);
CREATE INDEX tasks_space_id_next_follow_up_at_idx ON public.tasks(space_id, next_follow_up_at);
CREATE INDEX salary_settings_account_id_idx ON public.salary_settings(account_id);
CREATE INDEX debt_payments_space_id_paid_at_idx ON public.debt_payments(space_id, paid_at);
CREATE INDEX debt_payments_account_id_idx ON public.debt_payments(account_id);
CREATE INDEX debt_payments_from_account_id_idx ON public.debt_payments(from_account_id);

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.salary_settings
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

ALTER TABLE public.salary_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY member_select ON public.salary_settings FOR SELECT TO authenticated
  USING (private.is_space_member(space_id));
CREATE POLICY member_insert ON public.salary_settings FOR INSERT TO authenticated
  WITH CHECK (private.is_space_member(space_id));
CREATE POLICY member_update ON public.salary_settings FOR UPDATE TO authenticated
  USING (private.is_space_member(space_id))
  WITH CHECK (private.is_space_member(space_id));
CREATE POLICY member_delete ON public.salary_settings FOR DELETE TO authenticated
  USING (private.is_space_member(space_id));

CREATE POLICY member_select ON public.debt_payments FOR SELECT TO authenticated
  USING (private.is_space_member(space_id));
CREATE POLICY member_insert ON public.debt_payments FOR INSERT TO authenticated
  WITH CHECK (private.is_space_member(space_id));
CREATE POLICY member_update ON public.debt_payments FOR UPDATE TO authenticated
  USING (private.is_space_member(space_id))
  WITH CHECK (private.is_space_member(space_id));
CREATE POLICY member_delete ON public.debt_payments FOR DELETE TO authenticated
  USING (private.is_space_member(space_id));

REVOKE ALL ON public.salary_settings, public.debt_payments FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.salary_settings, public.debt_payments TO authenticated;
