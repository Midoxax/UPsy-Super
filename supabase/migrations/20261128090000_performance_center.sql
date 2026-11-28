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

-- 7. Pit crew links: read-only access for a coach, physio or parent ---------
-- The athlete creates one link per person and ticks what it shows. Never
-- clinical content: no journal, no assessments, no sessions with the
-- psychologist. Anyone holding the link sees the page (it is the secret),
-- so it can be revoked at any time and records when it was last opened.
CREATE TABLE IF NOT EXISTS public.athlete_crew_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL CHECK (length(label) BETWEEN 1 AND 80),
  role text NOT NULL DEFAULT 'coach' CHECK (role IN ('coach', 'physio', 'parent', 'other')),
  scopes text[] NOT NULL DEFAULT ARRAY['readiness', 'training', 'competitions']::text[]
    CHECK (cardinality(scopes) >= 1
           AND scopes <@ ARRAY['readiness', 'training', 'competitions', 'season']::text[]),
  token text NOT NULL UNIQUE
    DEFAULT replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_viewed_at timestamptz,
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_athlete_crew_links_athlete
  ON public.athlete_crew_links (athlete_id, created_at DESC);
ALTER TABLE public.athlete_crew_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own crew links" ON public.athlete_crew_links;
CREATE POLICY "own crew links" ON public.athlete_crew_links FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = athlete_id) WITH CHECK ((SELECT auth.uid()) = athlete_id);
-- The token is chosen by the database, never by the client: clients may
-- only write these columns (a table-wide grant would include the token).
-- Supabase's default privileges grant every column on new tables: revoke
-- them first, or the column grants below would change nothing.
REVOKE ALL ON public.athlete_crew_links FROM PUBLIC, anon, authenticated;
GRANT SELECT, DELETE ON public.athlete_crew_links TO authenticated;
GRANT INSERT (athlete_id, label, role, scopes) ON public.athlete_crew_links TO authenticated;
GRANT UPDATE (label, role, scopes, revoked_at) ON public.athlete_crew_links TO authenticated;
GRANT ALL ON public.athlete_crew_links TO service_role;

-- What a crew link shows. NULL for an unknown or revoked link.
CREATE OR REPLACE FUNCTION public.crew_view(_token text)
RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  _l public.athlete_crew_links;
  _out jsonb;
BEGIN
  IF _token IS NULL OR _token !~ '^[0-9a-f]{64}$' THEN RETURN NULL; END IF;
  SELECT * INTO _l FROM public.athlete_crew_links WHERE token = _token AND revoked_at IS NULL;
  IF NOT FOUND THEN RETURN NULL; END IF;
  UPDATE public.athlete_crew_links SET last_viewed_at = now() WHERE id = _l.id;

  _out := jsonb_build_object(
    'label', _l.label, 'role', _l.role, 'scopes', to_jsonb(_l.scopes),
    -- First name only: enough for the coach, nothing more.
    'athlete', coalesce(split_part((SELECT p.full_name FROM public.profiles p WHERE p.id = _l.athlete_id), ' ', 1), ''));
  IF 'readiness' = ANY(_l.scopes) THEN
    _out := _out || jsonb_build_object('checkins', coalesce((
      SELECT jsonb_agg(c ORDER BY c.created_at DESC) FROM (
        SELECT created_at, score, sleep_hours, soreness, hrv_ms
        FROM public.readiness_checkins WHERE user_id = _l.athlete_id
          AND created_at > now() - interval '42 days'
        ORDER BY created_at DESC LIMIT 60) c), '[]'::jsonb));
  END IF;
  IF 'training' = ANY(_l.scopes) THEN
    _out := _out || jsonb_build_object('sessions', coalesce((
      SELECT jsonb_agg(s ORDER BY s.session_date DESC) FROM (
        SELECT session_date, kind, duration_minutes, rpe, load
        FROM public.athlete_sessions WHERE user_id = _l.athlete_id
          AND session_date > current_date - 56
        ORDER BY session_date DESC LIMIT 150) s), '[]'::jsonb));
  END IF;
  IF 'competitions' = ANY(_l.scopes) THEN
    _out := _out || jsonb_build_object('competitions', coalesce((
      SELECT jsonb_agg(c ORDER BY c.event_date) FROM (
        SELECT name, event_date, location, importance,
               race_plan -> 'zone_low' AS zone_low, race_plan -> 'zone_high' AS zone_high,
               race_plan -> 'routine' AS routine, race_plan -> 'cues' AS cues
        FROM public.athlete_competitions WHERE user_id = _l.athlete_id
          AND event_date >= current_date - 30
        ORDER BY event_date LIMIT 12) c), '[]'::jsonb));
  END IF;
  IF 'season' = ANY(_l.scopes) THEN
    _out := _out || jsonb_build_object('season', coalesce((
      SELECT jsonb_agg(p ORDER BY p.starts_on) FROM (
        SELECT name, kind, starts_on, ends_on, focus
        FROM public.athlete_season_phases WHERE user_id = _l.athlete_id
          AND ends_on > current_date - 60) p), '[]'::jsonb));
  END IF;
  RETURN _out;
END $$;
REVOKE ALL ON FUNCTION public.crew_view(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.crew_view(text) TO anon, authenticated, service_role;

-- 8. The race engineer's weekly report -------------------------------------
-- Every Monday morning, each athlete active in the last 14 days gets a short
-- debrief of the past week: load vs the week before, average readiness and
-- its change, the next competition, and one thing to watch. In-app always;
-- by email unless they switch it off (notification_preferences).
ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS email_performance boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS public.performance_reports (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, week)
);
ALTER TABLE public.performance_reports ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.performance_reports FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.performance_reports TO service_role;

CREATE OR REPLACE FUNCTION public.performance_weekly_report()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  _week date := date_trunc('week', current_date)::date; -- this Monday
  _u record;
  _load int; _prev_load int; _n int;
  _ready int; _prev_ready int;
  _race text; _race_days int;
  _lang text; _email boolean;
  _title text; _body text; _watch text;
  _sent int := 0;
BEGIN
  FOR _u IN
    SELECT DISTINCT user_id FROM (
      SELECT user_id FROM public.athlete_sessions WHERE session_date >= current_date - 14
      UNION
      SELECT user_id FROM public.readiness_checkins WHERE created_at >= now() - interval '14 days'
    ) a
  LOOP
    -- Once per week, whatever the number of runs.
    INSERT INTO public.performance_reports (user_id, week) VALUES (_u.user_id, _week)
      ON CONFLICT DO NOTHING;
    IF NOT FOUND THEN CONTINUE; END IF;

    SELECT coalesce(sum(load), 0), count(*) INTO _load, _n FROM public.athlete_sessions
      WHERE user_id = _u.user_id AND session_date >= _week - 7 AND session_date < _week;
    SELECT coalesce(sum(load), 0) INTO _prev_load FROM public.athlete_sessions
      WHERE user_id = _u.user_id AND session_date >= _week - 14 AND session_date < _week - 7;
    SELECT round(avg(score)) INTO _ready FROM public.readiness_checkins
      WHERE user_id = _u.user_id AND created_at >= _week - 7 AND created_at < _week;
    SELECT round(avg(score)) INTO _prev_ready FROM public.readiness_checkins
      WHERE user_id = _u.user_id AND created_at >= _week - 14 AND created_at < _week - 7;
    SELECT name, event_date - current_date INTO _race, _race_days FROM public.athlete_competitions
      WHERE user_id = _u.user_id AND event_date >= current_date ORDER BY event_date LIMIT 1;

    SELECT CASE WHEN u.raw_user_meta_data->>'locale' IN ('en', 'ar') THEN u.raw_user_meta_data->>'locale' ELSE 'fr' END
      INTO _lang FROM auth.users u WHERE u.id = _u.user_id;
    SELECT coalesce((SELECT p.email_performance FROM public.notification_preferences p
                      WHERE p.user_id = _u.user_id), true) INTO _email;

    -- One thing to watch, most important first.
    _watch := CASE
      WHEN _prev_load > 0 AND _load > _prev_load * 1.5 THEN 'spike'
      WHEN _ready IS NOT NULL AND _prev_ready IS NOT NULL AND _ready <= _prev_ready - 8 THEN 'readiness'
      WHEN _race_days IS NOT NULL AND _race_days <= 7 THEN 'race'
      ELSE 'steady' END;

    IF _lang = 'en' THEN
      _title := 'Your week: load ' || _load || ' AU' || coalesce(', readiness ' || _ready, '');
      _body := 'Load: ' || _load || ' AU over ' || _n || ' sessions'
        || CASE WHEN _prev_load > 0 THEN ' (' || to_char(round(100.0 * (_load - _prev_load) / _prev_load), 'FMSG999') || ' % on the week before).' ELSE '.' END
        || coalesce(E'\nAverage readiness: ' || _ready || '/100'
             || CASE WHEN _prev_ready IS NOT NULL THEN ' (' || to_char(_ready - _prev_ready, 'FMSG99') || ' pts).' ELSE '.' END, '')
        || coalesce(E'\nNext competition: ' || _race || ' in ' || _race_days || ' days.', '')
        || E'\n' || CASE _watch
             WHEN 'spike' THEN 'To watch: a sharp rise in load. Talk to your coach before adding more.'
             WHEN 'readiness' THEN 'To watch: readiness is down. Make recovery the priority.'
             WHEN 'race' THEN 'To watch: competition week. Review your race plan and routine.'
             ELSE 'A steady week: keep the plan.' END;
    ELSIF _lang = 'ar' THEN
      _title := 'أسبوعك: الحِمل ' || _load || ' و.ع' || coalesce('، الجاهزية ' || _ready, '');
      _body := 'الحِمل: ' || _load || ' و.ع في ' || _n || ' حصص'
        || CASE WHEN _prev_load > 0 THEN ' (' || to_char(round(100.0 * (_load - _prev_load) / _prev_load), 'FMSG999') || ' % مقارنة بالأسبوع السابق).' ELSE '.' END
        || coalesce(E'\nمتوسط الجاهزية: ' || _ready || '/100'
             || CASE WHEN _prev_ready IS NOT NULL THEN ' (' || to_char(_ready - _prev_ready, 'FMSG99') || ' نقاط).' ELSE '.' END, '')
        || coalesce(E'\nالمنافسة القادمة: ' || _race || ' بعد ' || _race_days || ' أيام.', '')
        || E'\n' || CASE _watch
             WHEN 'spike' THEN 'للانتباه: ارتفاع حاد في الحِمل. تحدث مع مدربك قبل الزيادة.'
             WHEN 'readiness' THEN 'للانتباه: الجاهزية في انخفاض. الأولوية للاسترجاع.'
             WHEN 'race' THEN 'للانتباه: أسبوع منافسة. راجع خطة السباق والروتين.'
             ELSE 'أسبوع مستقر: حافظ على الخطة.' END;
    ELSE
      _title := 'Votre semaine : charge ' || _load || ' UA' || coalesce(', disponibilité ' || _ready, '');
      _body := 'Charge : ' || _load || ' UA sur ' || _n || ' séances'
        || CASE WHEN _prev_load > 0 THEN ' (' || to_char(round(100.0 * (_load - _prev_load) / _prev_load), 'FMSG999') || ' % par rapport à la semaine précédente).' ELSE '.' END
        || coalesce(E'\nDisponibilité moyenne : ' || _ready || '/100'
             || CASE WHEN _prev_ready IS NOT NULL THEN ' (' || to_char(_ready - _prev_ready, 'FMSG99') || ' pts).' ELSE '.' END, '')
        || coalesce(E'\nProchaine compétition : ' || _race || ' dans ' || _race_days || ' jours.', '')
        || E'\n' || CASE _watch
             WHEN 'spike' THEN 'À surveiller : forte hausse de la charge. Parlez-en à votre entraîneur avant d''en ajouter.'
             WHEN 'readiness' THEN 'À surveiller : la disponibilité baisse. Priorité à la récupération.'
             WHEN 'race' THEN 'À surveiller : semaine de compétition. Relisez votre plan de course et votre routine.'
             ELSE 'Semaine stable : on garde le plan.' END;
    END IF;

    PERFORM public.notify_user(_u.user_id, 'performance', _title, _body, '/athlete-hub#pit', _email);
    _sent := _sent + 1;
  END LOOP;
  RETURN _sent;
END $$;
REVOKE ALL ON FUNCTION public.performance_weekly_report() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.performance_weekly_report() TO service_role;

-- Mondays 07:10 UTC (08:10 in Casablanca).
DO $$
BEGIN
  IF to_regnamespace('cron') IS NULL THEN RETURN; END IF;
  PERFORM cron.schedule('performance-weekly-report', '10 7 * * 1',
                        'SELECT public.performance_weekly_report();');
END $$;

-- 9. Squad: a coach sees every athlete who addressed a crew link to them ---
-- The athlete may address a crew link to the coach's email. When that coach
-- signs in, the link appears on their squad board, still read-only and
-- limited to what the athlete ticked (through crew_view).
ALTER TABLE public.athlete_crew_links
  ADD COLUMN IF NOT EXISTS invite_email text
    CHECK (invite_email IS NULL OR (invite_email = lower(invite_email) AND invite_email LIKE '%_@_%'));
GRANT INSERT (invite_email), UPDATE (invite_email) ON public.athlete_crew_links TO authenticated;
CREATE INDEX IF NOT EXISTS idx_athlete_crew_links_invite
  ON public.athlete_crew_links (invite_email) WHERE invite_email IS NOT NULL AND revoked_at IS NULL;

CREATE OR REPLACE FUNCTION public.crew_squad()
RETURNS TABLE (token text, label text, role text, athlete text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT l.token, l.label, l.role,
         coalesce(split_part(p.full_name, ' ', 1), '')
    FROM public.athlete_crew_links l
    LEFT JOIN public.profiles p ON p.id = l.athlete_id
   WHERE l.revoked_at IS NULL
     AND l.invite_email IS NOT NULL
     AND l.invite_email = lower(auth.email())
   ORDER BY l.created_at;
$$;
REVOKE ALL ON FUNCTION public.crew_squad() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crew_squad() TO authenticated;

-- The invited coach is told, if they already have an account.
CREATE OR REPLACE FUNCTION public.crew_link_invited() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  _to uuid;
  _who text;
BEGIN
  IF NEW.invite_email IS NULL OR NEW.revoked_at IS NOT NULL
     OR (TG_OP = 'UPDATE' AND OLD.invite_email IS NOT DISTINCT FROM NEW.invite_email) THEN
    RETURN NEW;
  END IF;
  SELECT u.id INTO _to FROM auth.users u WHERE lower(u.email) = NEW.invite_email LIMIT 1;
  IF _to IS NULL OR _to = NEW.athlete_id THEN RETURN NEW; END IF;
  SELECT coalesce(nullif(split_part(p.full_name, ' ', 1), ''), 'Un athlète')
    INTO _who FROM public.profiles p WHERE p.id = NEW.athlete_id;
  PERFORM public.notify_user(_to, 'performance',
    coalesce(_who, 'Un athlète') || ' vous ouvre son muret des stands',
    'Vous voyez désormais, en lecture seule, ce que l''athlète a choisi de partager : disponibilité, charge, compétitions. Retrouvez-le dans votre écurie.',
    '/athlete-hub#squad', true);
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS crew_link_invited ON public.athlete_crew_links;
CREATE TRIGGER crew_link_invited AFTER INSERT OR UPDATE OF invite_email ON public.athlete_crew_links
  FOR EACH ROW EXECUTE FUNCTION public.crew_link_invited();
REVOKE ALL ON FUNCTION public.crew_link_invited() FROM PUBLIC, anon, authenticated;
