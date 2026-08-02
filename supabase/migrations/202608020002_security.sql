-- Supabase-specific identity, defaults, and row-level security.
-- Generated independently for Daixuan Life OS.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_user_id_auth_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.spaces
  ADD CONSTRAINT spaces_created_by_auth_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.space_members
  ADD CONSTRAINT space_members_user_id_auth_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.ai_action_drafts
  ADD CONSTRAINT ai_action_drafts_created_by_auth_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;

DO $defaults$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'profiles', 'spaces', 'space_members', 'projects', 'tasks', 'accounts',
    'finance_categories', 'transactions', 'budgets', 'recurring_expenses',
    'subscriptions', 'credit_cards', 'loans', 'savings_goals', 'purchase_plans',
    'sleep_logs', 'water_logs', 'workout_logs', 'daily_checkins', 'health_goals',
    'knowledge_notes', 'knowledge_tags', 'ai_action_drafts'
  ] LOOP
    EXECUTE format(
      'ALTER TABLE public.%I ALTER COLUMN id SET DEFAULT gen_random_uuid()',
      table_name
    );
  END LOOP;
END
$defaults$;

CREATE OR REPLACE FUNCTION private.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

DO $updated_at$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'profiles', 'spaces', 'projects', 'tasks', 'accounts', 'transactions',
    'budgets', 'recurring_expenses', 'subscriptions', 'credit_cards', 'loans',
    'savings_goals', 'purchase_plans', 'daily_checkins', 'health_goals',
    'knowledge_notes', 'ai_action_drafts'
  ] LOOP
    EXECUTE format(
      'ALTER TABLE public.%I ALTER COLUMN updated_at SET DEFAULT now()',
      table_name
    );
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I '
      'FOR EACH ROW EXECUTE FUNCTION private.set_updated_at()',
      table_name
    );
  END LOOP;
END
$updated_at$;

CREATE OR REPLACE FUNCTION private.is_space_member(target_space_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.space_members AS membership
    WHERE membership.space_id = target_space_id
      AND membership.user_id = (SELECT auth.uid())
  );
$function$;

CREATE OR REPLACE FUNCTION private.can_manage_space(target_space_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.spaces AS owned_space
    WHERE owned_space.id = target_space_id
      AND owned_space.created_by = (SELECT auth.uid())
  ) OR EXISTS (
    SELECT 1
    FROM public.space_members AS membership
    WHERE membership.space_id = target_space_id
      AND membership.user_id = (SELECT auth.uid())
      AND membership.role IN ('OWNER', 'ADMIN')
  );
$function$;

REVOKE ALL ON FUNCTION private.is_space_member(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.can_manage_space(uuid) FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_space_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_manage_space(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  personal_space_id uuid := gen_random_uuid();
  profile_name text := NULLIF(trim(NEW.raw_user_meta_data ->> 'display_name'), '');
BEGIN
  INSERT INTO public.profiles (user_id, display_name, updated_at)
  VALUES (NEW.id, profile_name, now());

  INSERT INTO public.spaces (id, name, kind, created_by, updated_at)
  VALUES (
    personal_space_id,
    COALESCE(profile_name || '的个人空间', '我的个人空间'),
    'PERSONAL',
    NEW.id,
    now()
  );

  INSERT INTO public.space_members (space_id, user_id, role)
  VALUES (personal_space_id, NEW.id, 'OWNER');

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION private.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own
  ON public.profiles FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY profiles_insert_own
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY profiles_update_own
  ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY profiles_delete_own
  ON public.profiles FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY spaces_select_member
  ON public.spaces FOR SELECT TO authenticated
  USING (private.is_space_member(id));

CREATE POLICY spaces_insert_creator
  ON public.spaces FOR INSERT TO authenticated
  WITH CHECK (created_by = (SELECT auth.uid()));

CREATE POLICY spaces_update_manager
  ON public.spaces FOR UPDATE TO authenticated
  USING (private.can_manage_space(id))
  WITH CHECK (private.can_manage_space(id));

CREATE POLICY spaces_delete_manager
  ON public.spaces FOR DELETE TO authenticated
  USING (private.can_manage_space(id));

CREATE POLICY space_members_select_member
  ON public.space_members FOR SELECT TO authenticated
  USING (private.is_space_member(space_id));

CREATE POLICY space_members_insert_manager
  ON public.space_members FOR INSERT TO authenticated
  WITH CHECK (private.can_manage_space(space_id));

CREATE POLICY space_members_update_manager
  ON public.space_members FOR UPDATE TO authenticated
  USING (private.can_manage_space(space_id))
  WITH CHECK (private.can_manage_space(space_id));

CREATE POLICY space_members_delete_manager
  ON public.space_members FOR DELETE TO authenticated
  USING (private.can_manage_space(space_id));

DO $business_rls$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'projects', 'tasks', 'accounts', 'finance_categories', 'transactions',
    'budgets', 'recurring_expenses', 'subscriptions', 'credit_cards', 'loans',
    'savings_goals', 'purchase_plans', 'sleep_logs', 'water_logs', 'workout_logs',
    'daily_checkins', 'health_goals', 'knowledge_notes', 'knowledge_tags', 'note_tags'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format(
      'CREATE POLICY member_select ON public.%I FOR SELECT TO authenticated '
      'USING (private.is_space_member(space_id))',
      table_name
    );
    EXECUTE format(
      'CREATE POLICY member_insert ON public.%I FOR INSERT TO authenticated '
      'WITH CHECK (private.is_space_member(space_id))',
      table_name
    );
    EXECUTE format(
      'CREATE POLICY member_update ON public.%I FOR UPDATE TO authenticated '
      'USING (private.is_space_member(space_id)) '
      'WITH CHECK (private.is_space_member(space_id))',
      table_name
    );
    EXECUTE format(
      'CREATE POLICY member_delete ON public.%I FOR DELETE TO authenticated '
      'USING (private.is_space_member(space_id))',
      table_name
    );
  END LOOP;
END
$business_rls$;

ALTER TABLE public.ai_action_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_drafts_select_own
  ON public.ai_action_drafts FOR SELECT TO authenticated
  USING (
    created_by = (SELECT auth.uid())
    AND private.is_space_member(space_id)
  );

CREATE POLICY ai_drafts_insert_own
  ON public.ai_action_drafts FOR INSERT TO authenticated
  WITH CHECK (
    created_by = (SELECT auth.uid())
    AND private.is_space_member(space_id)
  );

CREATE POLICY ai_drafts_update_own
  ON public.ai_action_drafts FOR UPDATE TO authenticated
  USING (
    created_by = (SELECT auth.uid())
    AND private.is_space_member(space_id)
  )
  WITH CHECK (
    created_by = (SELECT auth.uid())
    AND private.is_space_member(space_id)
  );

CREATE POLICY ai_drafts_delete_own
  ON public.ai_action_drafts FOR DELETE TO authenticated
  USING (
    created_by = (SELECT auth.uid())
    AND private.is_space_member(space_id)
  );

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
