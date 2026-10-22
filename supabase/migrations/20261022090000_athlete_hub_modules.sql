-- Athlete Hub, modules 5-7: goals, competitions, and sharing with a psychologist.
-- Modules 1-4 (check-in, readiness, protocols, journal) already have tables;
-- 8 (assessments) reuses assessments/assessment_results; 9 (progress report)
-- is computed from the rest.

-- 5. Goals -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.athlete_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  kind text NOT NULL DEFAULT 'process' CHECK (kind IN ('outcome', 'performance', 'process', 'mental')),
  target_date date,
  progress smallint NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'done', 'dropped')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_athlete_goals_user ON public.athlete_goals (user_id, status, created_at DESC);
ALTER TABLE public.athlete_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own goals" ON public.athlete_goals;
CREATE POLICY "own goals" ON public.athlete_goals FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.athlete_goals TO authenticated;
GRANT ALL ON public.athlete_goals TO service_role;

-- 6. Competitions ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.athlete_competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 200),
  event_date date NOT NULL,
  location text CHECK (length(location) <= 200),
  importance smallint NOT NULL DEFAULT 2 CHECK (importance BETWEEN 1 AND 3),
  -- Pre-competition routine: [{label, done}]
  checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  result text CHECK (length(result) <= 200),
  performance_rating smallint CHECK (performance_rating BETWEEN 1 AND 10),
  reflection text CHECK (length(reflection) <= 4000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_athlete_competitions_user ON public.athlete_competitions (user_id, event_date);
ALTER TABLE public.athlete_competitions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own competitions" ON public.athlete_competitions;
CREATE POLICY "own competitions" ON public.athlete_competitions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.athlete_competitions TO authenticated;
GRANT ALL ON public.athlete_competitions TO service_role;

CREATE OR REPLACE FUNCTION public.athlete_touch_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;
DROP TRIGGER IF EXISTS athlete_goals_touch ON public.athlete_goals;
CREATE TRIGGER athlete_goals_touch BEFORE UPDATE ON public.athlete_goals
  FOR EACH ROW EXECUTE FUNCTION public.athlete_touch_updated_at();
DROP TRIGGER IF EXISTS athlete_competitions_touch ON public.athlete_competitions;
CREATE TRIGGER athlete_competitions_touch BEFORE UPDATE ON public.athlete_competitions
  FOR EACH ROW EXECUTE FUNCTION public.athlete_touch_updated_at();

-- 7. Sharing with a psychologist ---------------------------------------------
-- The athlete chooses a psychologist they have booked and what to share.
-- Journals are never shared raw: the 'journal' scope exposes only the
-- AI reflection (summary + themes) the athlete already saw.
CREATE TABLE IF NOT EXISTS public.athlete_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  psychologist_id uuid NOT NULL REFERENCES public.psychologist_profiles(id) ON DELETE CASCADE,
  scopes text[] NOT NULL DEFAULT ARRAY['readiness','goals','competitions','protocols']::text[]
    CHECK (scopes <@ ARRAY['readiness','goals','competitions','protocols','journal','assessments']::text[]),
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  UNIQUE (athlete_id, psychologist_id)
);
ALTER TABLE public.athlete_shares ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "athlete manages own shares" ON public.athlete_shares;
CREATE POLICY "athlete manages own shares" ON public.athlete_shares FOR ALL TO authenticated
  USING (auth.uid() = athlete_id)
  WITH CHECK (
    auth.uid() = athlete_id
    AND EXISTS (SELECT 1 FROM public.bookings b
                WHERE b.patient_id = athlete_id AND b.psychologist_id = athlete_shares.psychologist_id)
  );
DROP POLICY IF EXISTS "psychologist sees shares to them" ON public.athlete_shares;
CREATE POLICY "psychologist sees shares to them" ON public.athlete_shares FOR SELECT TO authenticated
  USING (auth.uid() = psychologist_id AND revoked_at IS NULL);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.athlete_shares TO authenticated;
GRANT ALL ON public.athlete_shares TO service_role;

-- Psychologists the athlete can share with: anyone they have a booking with.
CREATE OR REPLACE FUNCTION public.athlete_share_candidates()
RETURNS TABLE (psychologist_id uuid, full_name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT DISTINCT p.id, p.full_name
  FROM public.bookings b JOIN public.psychologist_profiles p ON p.id = b.psychologist_id
  WHERE b.patient_id = auth.uid()
$$;
REVOKE ALL ON FUNCTION public.athlete_share_candidates() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.athlete_share_candidates() TO authenticated;

-- Athletes who share with the calling psychologist.
CREATE OR REPLACE FUNCTION public.athletes_shared_with_me()
RETURNS TABLE (athlete_id uuid, full_name text, scopes text[], shared_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.athlete_id, pr.full_name, s.scopes, s.created_at
  FROM public.athlete_shares s LEFT JOIN public.profiles pr ON pr.id = s.athlete_id
  WHERE s.psychologist_id = auth.uid() AND s.revoked_at IS NULL
  ORDER BY s.created_at DESC
$$;
REVOKE ALL ON FUNCTION public.athletes_shared_with_me() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.athletes_shared_with_me() TO authenticated;

-- What one athlete shares with the calling psychologist, limited to the
-- scopes granted. Returns NULL when there is no active share.
CREATE OR REPLACE FUNCTION public.athlete_shared_overview(p_athlete uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _scopes text[];
  _out jsonb := '{}'::jsonb;
BEGIN
  SELECT scopes INTO _scopes FROM public.athlete_shares
  WHERE athlete_id = p_athlete AND psychologist_id = auth.uid() AND revoked_at IS NULL;
  IF _scopes IS NULL THEN RETURN NULL; END IF;

  _out := jsonb_build_object('scopes', to_jsonb(_scopes));
  IF 'readiness' = ANY(_scopes) THEN
    _out := _out || jsonb_build_object('checkins', coalesce((
      SELECT jsonb_agg(c ORDER BY c.created_at DESC) FROM (
        SELECT created_at, score, mood, sleep, stress, energy, cognitive_load
        FROM public.readiness_checkins WHERE user_id = p_athlete
          AND created_at > now() - interval '90 days'
        ORDER BY created_at DESC LIMIT 90) c), '[]'::jsonb));
  END IF;
  IF 'goals' = ANY(_scopes) THEN
    _out := _out || jsonb_build_object('goals', coalesce((
      SELECT jsonb_agg(g ORDER BY g.created_at DESC) FROM (
        SELECT title, kind, target_date, progress, status, created_at
        FROM public.athlete_goals WHERE user_id = p_athlete AND status <> 'dropped') g), '[]'::jsonb));
  END IF;
  IF 'competitions' = ANY(_scopes) THEN
    _out := _out || jsonb_build_object('competitions', coalesce((
      SELECT jsonb_agg(c ORDER BY c.event_date DESC) FROM (
        SELECT name, event_date, location, importance, result, performance_rating, reflection
        FROM public.athlete_competitions WHERE user_id = p_athlete
        ORDER BY event_date DESC LIMIT 20) c), '[]'::jsonb));
  END IF;
  IF 'protocols' = ANY(_scopes) THEN
    _out := _out || jsonb_build_object('protocols', coalesce((
      SELECT jsonb_agg(x ORDER BY x.completed_at DESC) FROM (
        SELECT pc.completed_at, pc.rating, ap.slug, ap.title
        FROM public.protocol_completions pc JOIN public.athlete_protocols ap ON ap.id = pc.protocol_id
        WHERE pc.user_id = p_athlete AND pc.completed_at > now() - interval '90 days'
        ORDER BY pc.completed_at DESC LIMIT 60) x), '[]'::jsonb));
  END IF;
  IF 'journal' = ANY(_scopes) THEN
    _out := _out || jsonb_build_object('reflections', coalesce((
      SELECT jsonb_agg(j ORDER BY j.created_at DESC) FROM (
        SELECT created_at, mood_tag, ai_summary, themes
        FROM public.journal_entries WHERE user_id = p_athlete AND ai_summary IS NOT NULL
        ORDER BY created_at DESC LIMIT 20) j), '[]'::jsonb));
  END IF;
  IF 'assessments' = ANY(_scopes) THEN
    _out := _out || jsonb_build_object('assessments', coalesce((
      SELECT jsonb_agg(r ORDER BY r.completed_at DESC) FROM (
        SELECT a.title, ar.total_score, ar.interpretation, ar.completed_at
        FROM public.assessment_results ar JOIN public.assessments a ON a.id = ar.assessment_id
        WHERE ar.user_id = p_athlete AND a.category = 'athlete'
        ORDER BY ar.completed_at DESC LIMIT 20) r), '[]'::jsonb));
  END IF;
  RETURN _out;
END $$;
REVOKE ALL ON FUNCTION public.athlete_shared_overview(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.athlete_shared_overview(uuid) TO authenticated;

-- Protocol ratings: the athlete can rate a session after logging it.
DROP POLICY IF EXISTS "own completions update" ON public.protocol_completions;
CREATE POLICY "own completions update" ON public.protocol_completions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
GRANT UPDATE (rating) ON public.protocol_completions TO authenticated;
