-- ============================================================================
-- RESOURCES HUB
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.resource_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  name_fr text,
  name_ar text,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resource_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Topics are public" ON public.resource_topics FOR SELECT USING (true);
CREATE POLICY "Admins manage topics" ON public.resource_topics FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  title_fr text,
  title_ar text,
  summary text,
  summary_fr text,
  summary_ar text,
  format text NOT NULL CHECK (format IN ('article','guide','worksheet','video','audio','toolkit')),
  category text,
  topic_slug text,
  locale text NOT NULL DEFAULT 'en',
  content_md text,
  content_url text,
  download_url text,
  image_url text,
  read_minutes int,
  rating numeric(3,2) DEFAULT 4.7,
  view_count int NOT NULL DEFAULT 0,
  is_premium boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resources_published ON public.resources(is_published, is_featured);
CREATE INDEX IF NOT EXISTS idx_resources_format ON public.resources(format);
CREATE INDEX IF NOT EXISTS idx_resources_topic ON public.resources(topic_slug);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published resources are public" ON public.resources FOR SELECT
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage resources" ON public.resources FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_resources_updated BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.resource_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  action text NOT NULL DEFAULT 'view' CHECK (action IN ('view','download','complete')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, resource_id, action)
);

ALTER TABLE public.resource_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own completions" ON public.resource_completions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own completions" ON public.resource_completions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- DAILY CHALLENGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  title_fr text,
  description text,
  description_fr text,
  icon text DEFAULT '🎯',
  category text NOT NULL DEFAULT 'general',
  xp_reward int NOT NULL DEFAULT 20,
  action_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active challenges are public" ON public.daily_challenges FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage challenges" ON public.daily_challenges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.user_daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  assigned_for_date date NOT NULL DEFAULT CURRENT_DATE,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, assigned_for_date)
);

ALTER TABLE public.user_daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own daily challenges" ON public.user_daily_challenges FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- LEADERBOARD VIEW (anonymized)
-- ============================================================================

CREATE OR REPLACE VIEW public.gamification_leaderboard
WITH (security_invoker = true)
AS
SELECT
  up.user_id,
  COALESCE(NULLIF(p.full_name, ''), 'Anonymous') AS display_name,
  p.avatar_url,
  up.xp_total,
  up.xp_this_week,
  up.streak_days,
  RANK() OVER (ORDER BY up.xp_this_week DESC, up.xp_total DESC) AS rank
FROM public.user_progress up
LEFT JOIN public.profiles p ON p.id = up.user_id
WHERE up.xp_this_week > 0
ORDER BY up.xp_this_week DESC, up.xp_total DESC
LIMIT 50;

GRANT SELECT ON public.gamification_leaderboard TO authenticated;

-- ============================================================================
-- AWARD XP RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION public.award_xp(
  p_action text,
  p_xp int DEFAULT 10,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_today date := CURRENT_DATE;
  v_last date;
  v_streak int;
  v_best int;
  v_new_total int;
  v_new_week int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF p_xp IS NULL OR p_xp < 0 OR p_xp > 1000 THEN
    p_xp := 10;
  END IF;

  -- Upsert progress
  INSERT INTO public.user_progress (user_id, xp_total, xp_this_week, streak_days, streak_best, last_activity_at)
  VALUES (v_uid, p_xp, p_xp, 1, 1, now())
  ON CONFLICT (user_id) DO UPDATE
  SET
    xp_total = user_progress.xp_total + p_xp,
    xp_this_week = user_progress.xp_this_week + p_xp,
    streak_days = CASE
      WHEN user_progress.last_activity_at::date = v_today THEN user_progress.streak_days
      WHEN user_progress.last_activity_at::date = v_today - 1 THEN user_progress.streak_days + 1
      ELSE 1
    END,
    streak_best = GREATEST(
      user_progress.streak_best,
      CASE
        WHEN user_progress.last_activity_at::date = v_today THEN user_progress.streak_days
        WHEN user_progress.last_activity_at::date = v_today - 1 THEN user_progress.streak_days + 1
        ELSE 1
      END
    ),
    last_activity_at = now(),
    updated_at = now()
  RETURNING xp_total, xp_this_week, streak_days, streak_best
  INTO v_new_total, v_new_week, v_streak, v_best;

  RETURN jsonb_build_object(
    'ok', true,
    'action', p_action,
    'xp_awarded', p_xp,
    'xp_total', v_new_total,
    'xp_this_week', v_new_week,
    'streak_days', v_streak,
    'streak_best', v_best
  );
END;
$$;

-- ============================================================================
-- DAILY CHALLENGE RPCs
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_or_assign_daily_challenge()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_today date := CURRENT_DATE;
  v_existing record;
  v_new_challenge record;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT udc.id AS user_challenge_id, udc.completed_at, c.*
  INTO v_existing
  FROM public.user_daily_challenges udc
  JOIN public.daily_challenges c ON c.id = udc.challenge_id
  WHERE udc.user_id = v_uid AND udc.assigned_for_date = v_today
  LIMIT 1;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'user_challenge_id', v_existing.user_challenge_id,
      'completed', v_existing.completed_at IS NOT NULL,
      'challenge', jsonb_build_object(
        'slug', v_existing.slug, 'title', v_existing.title, 'title_fr', v_existing.title_fr,
        'description', v_existing.description, 'description_fr', v_existing.description_fr,
        'icon', v_existing.icon, 'xp_reward', v_existing.xp_reward, 'action_url', v_existing.action_url
      )
    );
  END IF;

  -- Pick a random active challenge
  SELECT * INTO v_new_challenge
  FROM public.daily_challenges
  WHERE is_active = true
  ORDER BY random()
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'no_challenges_available');
  END IF;

  INSERT INTO public.user_daily_challenges (user_id, challenge_id, assigned_for_date)
  VALUES (v_uid, v_new_challenge.id, v_today)
  RETURNING id INTO v_existing.user_challenge_id;

  RETURN jsonb_build_object(
    'user_challenge_id', v_existing.user_challenge_id,
    'completed', false,
    'challenge', jsonb_build_object(
      'slug', v_new_challenge.slug, 'title', v_new_challenge.title, 'title_fr', v_new_challenge.title_fr,
      'description', v_new_challenge.description, 'description_fr', v_new_challenge.description_fr,
      'icon', v_new_challenge.icon, 'xp_reward', v_new_challenge.xp_reward, 'action_url', v_new_challenge.action_url
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_daily_challenge(p_user_challenge_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_xp int;
  v_completed_at timestamptz;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT udc.completed_at, c.xp_reward
  INTO v_completed_at, v_xp
  FROM public.user_daily_challenges udc
  JOIN public.daily_challenges c ON c.id = udc.challenge_id
  WHERE udc.id = p_user_challenge_id AND udc.user_id = v_uid;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  IF v_completed_at IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_completed');
  END IF;

  UPDATE public.user_daily_challenges
  SET completed_at = now()
  WHERE id = p_user_challenge_id;

  PERFORM public.award_xp('daily_challenge', v_xp, jsonb_build_object('challenge_id', p_user_challenge_id));

  RETURN jsonb_build_object('ok', true, 'xp_awarded', v_xp);
END;
$$;