-- U.Psy longitudinal study: well-being and performance in athletes.
--
-- Participants enrol from the Athlete Hub with informed consent and get a
-- random participant code. Questionnaire answers are stored raw (scores are
-- recomputable). Investigators export through study_export(), which returns
-- participant codes only: no user ids, names, emails or free text.
-- Daily readiness check-ins and competition ratings already live in the hub;
-- the export includes those observed between consent and withdrawal.

CREATE TABLE IF NOT EXISTS public.study_enrollments (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_code text NOT NULL UNIQUE,
  consent_version text NOT NULL CHECK (length(consent_version) BETWEEN 1 AND 40),
  consented_at timestamptz NOT NULL DEFAULT now(),
  birth_year smallint NOT NULL CHECK (birth_year BETWEEN 1920 AND 2010),
  sex text NOT NULL CHECK (sex IN ('female', 'male', 'other', 'undisclosed')),
  sport text NOT NULL CHECK (length(sport) BETWEEN 1 AND 80),
  level text NOT NULL CHECK (level IN ('recreational', 'competitive', 'national', 'international')),
  withdrawn_at timestamptz,
  -- Withdrawn and asked for their study data to be deleted: excluded from
  -- every export, study answers removed.
  data_deleted boolean NOT NULL DEFAULT false
);
ALTER TABLE public.study_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own enrollment" ON public.study_enrollments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
GRANT SELECT ON public.study_enrollments TO authenticated;
GRANT ALL ON public.study_enrollments TO service_role;

CREATE TABLE IF NOT EXISTS public.study_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instrument text NOT NULL CHECK (instrument IN ('who5', 'pss10', 'abq', 'mti', 'sleep')),
  -- First day of the measurement window the answer belongs to.
  period_start date NOT NULL,
  answers numeric[] NOT NULL CHECK (
    array_length(answers, 1) = CASE instrument
      WHEN 'who5' THEN 5 WHEN 'pss10' THEN 10 WHEN 'abq' THEN 15
      WHEN 'mti' THEN 8 WHEN 'sleep' THEN 3 END
  ),
  score numeric NOT NULL,
  subscores jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, instrument, period_start)
);
CREATE INDEX IF NOT EXISTS idx_study_responses_user ON public.study_responses (user_id, instrument, period_start DESC);
ALTER TABLE public.study_responses ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.study_is_active(p_user uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.study_enrollments
                 WHERE user_id = p_user AND withdrawn_at IS NULL)
$$;
REVOKE ALL ON FUNCTION public.study_is_active(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.study_is_active(uuid) TO authenticated;

CREATE POLICY "own responses read" ON public.study_responses FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "active participant answers" ON public.study_responses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.study_is_active(auth.uid()));
CREATE POLICY "active participant corrects" ON public.study_responses FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND public.study_is_active(auth.uid()))
  WITH CHECK (auth.uid() = user_id);
GRANT SELECT, INSERT, UPDATE ON public.study_responses TO authenticated;
GRANT ALL ON public.study_responses TO service_role;

-- Enrol the caller. The participant code is drawn here so nobody picks
-- their own; age is checked against the current year (18+ only).
CREATE OR REPLACE FUNCTION public.study_enroll(
  p_consent_version text, p_birth_year int, p_sex text, p_sport text, p_level text
) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _code text;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;
  IF p_birth_year > extract(year FROM now())::int - 18 THEN
    RAISE EXCEPTION 'participants must be 18 or older';
  END IF;
  SELECT participant_code INTO _code FROM public.study_enrollments WHERE user_id = _uid;
  IF _code IS NOT NULL THEN
    -- Re-joining after a withdrawal keeps the code, so the series stays one participant.
    UPDATE public.study_enrollments
       SET withdrawn_at = NULL, data_deleted = false, consent_version = p_consent_version,
           consented_at = now(), birth_year = p_birth_year, sex = p_sex,
           sport = btrim(p_sport), level = p_level
     WHERE user_id = _uid;
    RETURN _code;
  END IF;
  LOOP
    _code := 'UPS-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.study_enrollments WHERE participant_code = _code);
  END LOOP;
  INSERT INTO public.study_enrollments
    (user_id, participant_code, consent_version, birth_year, sex, sport, level)
  VALUES (_uid, _code, p_consent_version, p_birth_year, p_sex, btrim(p_sport), p_level);
  RETURN _code;
END $$;
REVOKE ALL ON FUNCTION public.study_enroll(text, int, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.study_enroll(text, int, text, text, text) TO authenticated;

-- Withdraw at any time. p_delete removes the study answers and keeps the
-- participant out of every export; otherwise data up to today stays in.
CREATE OR REPLACE FUNCTION public.study_withdraw(p_delete boolean)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;
  UPDATE public.study_enrollments
     SET withdrawn_at = coalesce(withdrawn_at, now()), data_deleted = p_delete
   WHERE user_id = auth.uid();
  IF p_delete THEN
    DELETE FROM public.study_responses WHERE user_id = auth.uid();
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.study_withdraw(boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.study_withdraw(boolean) TO authenticated;

-- Investigator exports (admins only, every call audited) --------------------

CREATE OR REPLACE FUNCTION public.study_participants()
RETURNS TABLE (
  participant_code text, consent_version text, consented_on date, withdrawn_on date,
  birth_year smallint, sex text, sport text, level text
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'admins only';
  END IF;
  INSERT INTO public.audit_log (user_id, action, resource_type, metadata)
  VALUES (auth.uid(), 'export', 'study_participants', '{}'::jsonb);
  RETURN QUERY
    SELECT e.participant_code, e.consent_version, e.consented_at::date, e.withdrawn_at::date,
           e.birth_year, e.sex, e.sport, e.level
    FROM public.study_enrollments e
    WHERE NOT e.data_deleted
    ORDER BY e.participant_code;
END $$;
REVOKE ALL ON FUNCTION public.study_participants() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.study_participants() TO authenticated;

-- Long ("tidy") format: one row per participant, source, day and item.
CREATE OR REPLACE FUNCTION public.study_export()
RETURNS TABLE (participant_code text, source text, observed_on date, item text, value numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'admins only';
  END IF;
  INSERT INTO public.audit_log (user_id, action, resource_type, metadata)
  VALUES (auth.uid(), 'export', 'study_data', '{}'::jsonb);
  RETURN QUERY
  WITH p AS (
    SELECT e.user_id, e.participant_code AS code, e.consented_at AS t0,
           coalesce(e.withdrawn_at, now()) AS t1
    FROM public.study_enrollments e WHERE NOT e.data_deleted
  )
  -- Questionnaire items (r.period_start is the window, not a timestamp,
  -- so withdrawal bounds use created_at).
  SELECT p.code, r.instrument, r.period_start, r.instrument || '_' || a.n, a.v
  FROM p JOIN public.study_responses r ON r.user_id = p.user_id AND r.created_at <= p.t1
  CROSS JOIN LATERAL unnest(r.answers) WITH ORDINALITY AS a(v, n)
  UNION ALL
  SELECT p.code, r.instrument, r.period_start, r.instrument || '_score', r.score
  FROM p JOIN public.study_responses r ON r.user_id = p.user_id AND r.created_at <= p.t1
  UNION ALL
  SELECT p.code, r.instrument, r.period_start, r.instrument || '_' || s.key, (s.value #>> '{}')::numeric
  FROM p JOIN public.study_responses r ON r.user_id = p.user_id AND r.created_at <= p.t1
  CROSS JOIN LATERAL jsonb_each(r.subscores) AS s
  UNION ALL
  -- Daily readiness check-ins (Moroccan calendar day).
  SELECT p.code, 'readiness', (c.created_at AT TIME ZONE 'Africa/Casablanca')::date, k.item, k.v
  FROM p JOIN public.readiness_checkins c
    ON c.user_id = p.user_id AND c.created_at BETWEEN p.t0 AND p.t1
  CROSS JOIN LATERAL (VALUES
    ('readiness_score', c.score::numeric), ('readiness_mood', c.mood::numeric),
    ('readiness_sleep', c.sleep::numeric), ('readiness_stress', c.stress::numeric),
    ('readiness_energy', c.energy::numeric), ('readiness_cognitive_load', c.cognitive_load::numeric)
  ) AS k(item, v)
  UNION ALL
  -- Competitions: importance and self-rated performance. Names, places,
  -- results and reflections are free text and stay out.
  SELECT p.code, 'competition', m.event_date, k.item, k.v
  FROM p JOIN public.athlete_competitions m
    ON m.user_id = p.user_id AND m.event_date BETWEEN p.t0::date AND p.t1::date
  CROSS JOIN LATERAL (VALUES
    ('competition_importance', m.importance::numeric),
    ('competition_performance_rating', m.performance_rating::numeric)
  ) AS k(item, v)
  WHERE k.v IS NOT NULL
  ORDER BY 1, 3, 2, 4;
END $$;
REVOKE ALL ON FUNCTION public.study_export() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.study_export() TO authenticated;

-- Enrolment counts for the admin page, without any identifier.
CREATE OR REPLACE FUNCTION public.study_stats()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'admins only';
  END IF;
  RETURN jsonb_build_object(
    'enrolled', (SELECT count(*) FROM public.study_enrollments WHERE withdrawn_at IS NULL),
    'withdrawn', (SELECT count(*) FROM public.study_enrollments WHERE withdrawn_at IS NOT NULL),
    'responses', (SELECT count(*) FROM public.study_responses),
    'responses_7d', (SELECT count(*) FROM public.study_responses WHERE created_at > now() - interval '7 days')
  );
END $$;
REVOKE ALL ON FUNCTION public.study_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.study_stats() TO authenticated;
