CREATE TABLE public.survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token uuid NOT NULL DEFAULT gen_random_uuid(),
  track text NOT NULL CHECK (track IN ('patient','psychologist')),
  language text NOT NULL DEFAULT 'fr' CHECK (language IN ('fr','ar','en')),
  referral_source text,
  ambassador_code text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed boolean NOT NULL DEFAULT false,
  last_step integer NOT NULL DEFAULT 0,
  total_steps integer NOT NULL DEFAULT 0,
  duration_seconds integer,
  device_type text,
  vw_coherent boolean,
  created_at timestamptz NOT NULL DEFAULT date_trunc('hour', now()),
  completed_at timestamptz
);

CREATE INDEX idx_survey_responses_token ON public.survey_responses(session_token);
CREATE INDEX idx_survey_responses_track ON public.survey_responses(track, completed);

GRANT INSERT, UPDATE ON public.survey_responses TO anon, authenticated;
GRANT ALL ON public.survey_responses TO service_role;

ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Anyone may start a response. It must start incomplete.
CREATE POLICY "Anyone can start a survey response"
  ON public.survey_responses FOR INSERT TO anon, authenticated
  WITH CHECK (
    completed = false
    AND completed_at IS NULL
    AND last_step >= 0
    AND length(coalesce(ambassador_code, '')) <= 64
    AND length(coalesce(referral_source, '')) <= 200
  );

-- A respondent may only advance their own in-progress row, identified by the
-- session token they generated client-side. Completed rows become immutable.
CREATE POLICY "Respondents can update their own unfinished response"
  ON public.survey_responses FOR UPDATE TO anon, authenticated
  USING (completed = false)
  WITH CHECK (true);

-- Deliberately NO SELECT policy: no client, signed in or not, can read rows.

-- Admin-only aggregate access. Returns distributions, never raw rows.
CREATE OR REPLACE FUNCTION public.observatoire_summary()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT jsonb_build_object(
    'totals', (
      SELECT jsonb_build_object(
        'started', count(*),
        'completed', count(*) FILTER (WHERE completed),
        'patient', count(*) FILTER (WHERE track = 'patient' AND completed),
        'psychologist', count(*) FILTER (WHERE track = 'psychologist' AND completed),
        'median_duration_seconds', percentile_disc(0.5) WITHIN GROUP (ORDER BY duration_seconds)
      ) FROM public.survey_responses
    ),
    'by_language', (
      SELECT coalesce(jsonb_object_agg(language, n), '{}'::jsonb)
      FROM (SELECT language, count(*) AS n FROM public.survey_responses WHERE completed GROUP BY language) s
    ),
    'by_device', (
      SELECT coalesce(jsonb_object_agg(coalesce(device_type,'unknown'), n), '{}'::jsonb)
      FROM (SELECT device_type, count(*) AS n FROM public.survey_responses WHERE completed GROUP BY device_type) s
    ),
    'by_day', (
      SELECT coalesce(jsonb_object_agg(d::text, n), '{}'::jsonb)
      FROM (SELECT date_trunc('day', created_at)::date AS d, count(*) AS n
            FROM public.survey_responses WHERE completed GROUP BY 1 ORDER BY 1) s
    ),
    'vw_coherent', (
      SELECT jsonb_build_object(
        'coherent', count(*) FILTER (WHERE vw_coherent),
        'incoherent', count(*) FILTER (WHERE vw_coherent = false)
      ) FROM public.survey_responses WHERE completed AND track = 'patient'
    ),
    'dropoff', (
      SELECT coalesce(jsonb_object_agg(last_step::text, n), '{}'::jsonb)
      FROM (SELECT last_step, count(*) AS n FROM public.survey_responses
            WHERE completed = false GROUP BY last_step ORDER BY last_step) s
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Admin-only aggregate over answer keys (Likert means, distributions).
CREATE OR REPLACE FUNCTION public.observatoire_answer_stats(_track text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT coalesce(jsonb_object_agg(k, v), '{}'::jsonb) INTO result
  FROM (
    SELECT kv.key AS k,
           jsonb_build_object(
             'n', count(*),
             'distribution', jsonb_object_agg_unique_value(kv.value)
           ) AS v
    FROM public.survey_responses r,
         LATERAL jsonb_each(r.answers) kv
    WHERE r.completed AND r.track = _track
      AND jsonb_typeof(kv.value) IN ('number','string','boolean')
    GROUP BY kv.key
  ) s;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.observatoire_summary() FROM public;
REVOKE ALL ON FUNCTION public.observatoire_answer_stats(text) FROM public;
GRANT EXECUTE ON FUNCTION public.observatoire_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.observatoire_answer_stats(text) TO authenticated;