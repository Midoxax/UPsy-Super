-- The Athlete Hub becomes a Performance Center: telemetry, load, the
-- performance profile, race plans and debriefs, the season, and what an
-- athlete can share with their psychologist.
--
-- Methods, so the numbers mean what sport scientists mean by them:
--   * session load = duration (min) x session RPE on the CR-10 scale
--     (Foster et al., 2001); acute (7 d) and chronic (28 d) load, monotony
--     and strain (Foster, 1998) are computed from it in the client;
--   * performance profiling (Butler & Hardy, 1992): the athlete names the
--     qualities that matter in their sport and rates current vs ideal;
--   * race plans: the individual zone of optimal functioning (Hanin), a
--     timed routine, if-then plans (Gollwitzer, 1999) and cue words;
--     the pre-race check rates intensity and direction of anxiety
--     (Jones & Swain, 1992); the debrief is an after-action review.
-- Everything is the athlete's own data (row-level security on user_id);
-- a psychologist sees it only through athlete_shared_overview, per scope.

-- 1. Telemetry on the daily check-in (all optional) --------------------------
ALTER TABLE public.readiness_checkins
  ADD COLUMN IF NOT EXISTS sleep_hours numeric(3,1) CHECK (sleep_hours BETWEEN 0 AND 16),
  ADD COLUMN IF NOT EXISTS soreness smallint CHECK (soreness BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS hrv_ms smallint CHECK (hrv_ms BETWEEN 5 AND 300),
  ADD COLUMN IF NOT EXISTS resting_hr smallint CHECK (resting_hr BETWEEN 25 AND 140);

-- 2. Training sessions and their load (session RPE) --------------------------
CREATE TABLE IF NOT EXISTS public.athlete_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date date NOT NULL DEFAULT current_date,
  kind text NOT NULL DEFAULT 'training'
    CHECK (kind IN ('training', 'match', 'strength', 'conditioning', 'recovery', 'mental', 'other')),
  duration_minutes smallint NOT NULL CHECK (duration_minutes BETWEEN 1 AND 600),
  rpe smallint NOT NULL CHECK (rpe BETWEEN 0 AND 10),
  load integer GENERATED ALWAYS AS (duration_minutes * rpe) STORED,
  note text CHECK (length(note) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_athlete_sessions_user_date
  ON public.athlete_sessions (user_id, session_date DESC);
ALTER TABLE public.athlete_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own sessions" ON public.athlete_sessions;
CREATE POLICY "own sessions" ON public.athlete_sessions FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.athlete_sessions TO authenticated;
GRANT ALL ON public.athlete_sessions TO service_role;

-- 3. Performance profile snapshots -------------------------------------------
-- qualities: [{label, area: mental|physical|technical|tactical, current 1-10,
-- ideal 1-10}]. A new snapshot each time, so progress shows over months.
CREATE TABLE IF NOT EXISTS public.athlete_profile_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  qualities jsonb NOT NULL
    CHECK (jsonb_typeof(qualities) = 'array' AND jsonb_array_length(qualities) BETWEEN 1 AND 20),
  note text CHECK (length(note) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_athlete_profile_snapshots_user
  ON public.athlete_profile_snapshots (user_id, created_at DESC);
ALTER TABLE public.athlete_profile_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own profile snapshots" ON public.athlete_profile_snapshots;
CREATE POLICY "own profile snapshots" ON public.athlete_profile_snapshots FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.athlete_profile_snapshots TO authenticated;
GRANT ALL ON public.athlete_profile_snapshots TO service_role;

-- 4. Race plan, pre-race state and debrief on each competition --------------
-- race_plan: {zone_low, zone_high (1-10 activation), routine: [{at_minutes
--   before start, label, done}], if_then: [{if, then}], cues: [text],
--   focus: text}
-- pre_state: {cognitive, somatic, confidence (1-10), direction (-3..+3,
--   debilitative..facilitative), activation (1-10), at}
-- debrief: {planned, happened, why, keep, change, controllables (1-10)}
ALTER TABLE public.athlete_competitions
  ADD COLUMN IF NOT EXISTS race_plan jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS pre_state jsonb,
  ADD COLUMN IF NOT EXISTS debrief jsonb;
DO $$ BEGIN
  ALTER TABLE public.athlete_competitions ADD CONSTRAINT athlete_competitions_plan_shape
    CHECK (jsonb_typeof(race_plan) = 'object'
           AND (pre_state IS NULL OR jsonb_typeof(pre_state) = 'object')
           AND (debrief IS NULL OR jsonb_typeof(debrief) = 'object'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. Season plan: periodised phases ------------------------------------------
CREATE TABLE IF NOT EXISTS public.athlete_season_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  kind text NOT NULL
    CHECK (kind IN ('general_prep', 'specific_prep', 'pre_competition', 'competition', 'transition')),
  starts_on date NOT NULL,
  ends_on date NOT NULL,
  focus text CHECK (length(focus) <= 300),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_on >= starts_on)
);
CREATE INDEX IF NOT EXISTS idx_athlete_season_phases_user
  ON public.athlete_season_phases (user_id, starts_on);
ALTER TABLE public.athlete_season_phases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own season phases" ON public.athlete_season_phases;
CREATE POLICY "own season phases" ON public.athlete_season_phases FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.athlete_season_phases TO authenticated;
GRANT ALL ON public.athlete_season_phases TO service_role;

-- 6. Sharing: training load, the profile and the season can be shared too --
ALTER TABLE public.athlete_shares DROP CONSTRAINT IF EXISTS athlete_shares_scopes_check;
ALTER TABLE public.athlete_shares ADD CONSTRAINT athlete_shares_scopes_check
  CHECK (scopes <@ ARRAY['readiness','goals','competitions','protocols','journal','assessments',
                         'training','profile','season']::text[]);

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
        SELECT created_at, score, mood, sleep, stress, energy, cognitive_load,
               sleep_hours, soreness, hrv_ms, resting_hr
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
        SELECT name, event_date, location, importance, result, performance_rating, reflection,
               race_plan, pre_state, debrief
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
  IF 'training' = ANY(_scopes) THEN
    _out := _out || jsonb_build_object('sessions', coalesce((
      SELECT jsonb_agg(s ORDER BY s.session_date DESC) FROM (
        SELECT session_date, kind, duration_minutes, rpe, load
        FROM public.athlete_sessions WHERE user_id = p_athlete
          AND session_date > current_date - 90
        ORDER BY session_date DESC LIMIT 200) s), '[]'::jsonb));
  END IF;
  IF 'profile' = ANY(_scopes) THEN
    _out := _out || jsonb_build_object('profiles', coalesce((
      SELECT jsonb_agg(p ORDER BY p.created_at DESC) FROM (
        SELECT created_at, qualities, note
        FROM public.athlete_profile_snapshots WHERE user_id = p_athlete
        ORDER BY created_at DESC LIMIT 6) p), '[]'::jsonb));
  END IF;
  IF 'season' = ANY(_scopes) THEN
    _out := _out || jsonb_build_object('season', coalesce((
      SELECT jsonb_agg(p ORDER BY p.starts_on) FROM (
        SELECT name, kind, starts_on, ends_on, focus
        FROM public.athlete_season_phases WHERE user_id = p_athlete
          AND ends_on > current_date - 365) p), '[]'::jsonb));
  END IF;
  RETURN _out;
END $$;
REVOKE ALL ON FUNCTION public.athlete_shared_overview(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.athlete_shared_overview(uuid) TO authenticated;
