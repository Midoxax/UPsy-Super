
-- Coupons: remove broad authenticated read; keep admin-manage.
DROP POLICY IF EXISTS "Authenticated read active coupons" ON public.coupons;

-- user_badges: drop client insert policies. Awarded only via SECURITY DEFINER RPCs.
DROP POLICY IF EXISTS "Users can earn badges" ON public.user_badges;
DROP POLICY IF EXISTS "users insert own badges" ON public.user_badges;

-- user_progress: drop direct client write policies.
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can upsert own progress" ON public.user_progress;

-- user_streaks: drop ALL policy, keep SELECT for owner/admin only.
DROP POLICY IF EXISTS "users manage own streaks" ON public.user_streaks;
CREATE POLICY "users read own streaks" ON public.user_streaks
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- xp_events: drop client insert.
DROP POLICY IF EXISTS "users insert own xp" ON public.xp_events;

-- user_skill_nodes: drop ALL policy; keep SELECT for owner/admin.
DROP POLICY IF EXISTS "users manage own skill nodes" ON public.user_skill_nodes;
CREATE POLICY "users read own skill nodes" ON public.user_skill_nodes
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- user_quest_progress: drop ALL policy; keep SELECT for owner/admin.
DROP POLICY IF EXISTS "users manage own quest progress" ON public.user_quest_progress;
CREATE POLICY "users read own quest progress" ON public.user_quest_progress
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Server-side RPC to start a quest (replaces client-side upsert).
CREATE OR REPLACE FUNCTION public.quest_start(_quest_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_quest RECORD;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  SELECT slug, is_active INTO v_quest
  FROM public.quests WHERE slug = _quest_slug;

  IF NOT FOUND OR NOT v_quest.is_active THEN
    RAISE EXCEPTION 'quest_not_available';
  END IF;

  INSERT INTO public.user_quest_progress(user_id, quest_slug, step_idx, state)
  VALUES (v_uid, _quest_slug, 0, '{}'::jsonb)
  ON CONFLICT (user_id, quest_slug) DO NOTHING;

  RETURN jsonb_build_object('ok', true, 'quest_slug', _quest_slug);
END $$;

REVOKE ALL ON FUNCTION public.quest_start(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.quest_start(text) TO authenticated;
