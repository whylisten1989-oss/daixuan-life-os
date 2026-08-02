-- Close least-privilege gaps and add covering indexes reported by Supabase advisors.

REVOKE ALL ON FUNCTION private.set_updated_at() FROM PUBLIC, anon, authenticated;

CREATE INDEX ai_action_drafts_created_by_idx
  ON public.ai_action_drafts(created_by);

CREATE INDEX budgets_category_id_idx
  ON public.budgets(category_id);

CREATE INDEX note_tags_space_id_tag_id_idx
  ON public.note_tags(space_id, tag_id);

CREATE INDEX spaces_created_by_idx
  ON public.spaces(created_by);

CREATE INDEX tasks_project_id_idx
  ON public.tasks(project_id);

CREATE INDEX transactions_category_id_idx
  ON public.transactions(category_id);
