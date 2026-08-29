-- 1. Remove direct client write access; all writes go through a controlled function.
DROP POLICY IF EXISTS "Anyone can start a survey response" ON public.survey_responses;
DROP POLICY IF EXISTS "Respondents can update their own unfinished response" ON public.survey_responses;
REVOKE INSERT, UPDATE ON public.survey_responses FROM anon, authenticated;

-- 2. Single controlled save path. Keyed strictly on the caller's own session token.
CREATE OR REPLACE FUNCTION public.survey_save(
  _session_token uuid,
  _track text,
  _language text,
  _answers jsonb,
  _last_step integer,
  _total_steps integer,
  _completed boolean DEFAULT false,
  _referral_source text DEFAULT NULL,
  _ambassador_code text DEFAULT NULL,
  _device_type text DEFAULT NULL,
  _duration_seconds integer DEFAULT NULL,
  _vw_coherent boolean DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing public.survey_responses%ROWTYPE;
BEGIN
  IF _track NOT IN ('patient','psychologist') THEN
    RAISE EXCEPTION 'invalid track';
  END IF;
  IF coalesce(_language,'fr') NOT IN ('fr','ar','en') THEN
    RAISE EXCEPTION 'invalid language';
  END IF;
  IF _last_step < 0 OR _last_step > 200 OR coalesce(_total_steps,0) > 200 THEN
    RAISE EXCEPTION 'invalid step';
  END IF;
  IF length(coalesce(_ambassador_code,'')) > 64
     OR length(coalesce(_referral_source,'')) > 200
     OR length(coalesce(_device_type,'')) > 32 THEN
    RAISE EXCEPTION 'field too long';
  END IF;
  IF pg_column_size(coalesce(_answers,'{}'::jsonb)) > 32768 THEN
    RAISE EXCEPTION 'payload too large';
  END IF;

  SELECT * INTO existing FROM public.survey_responses WHERE session_token = _session_token;

  IF NOT FOUND THEN
    INSERT INTO public.survey_responses (
      session_token, track, language, answers, last_step, total_steps,
      completed, completed_at, referral_source, ambassador_code,
      device_type, duration_seconds, vw_coherent
    ) VALUES (
      _session_token, _track, coalesce(_language,'fr'), coalesce(_answers,'{}'::jsonb),
      _last_step, coalesce(_total_steps,0), coalesce(_completed,false),
      CASE WHEN _completed THEN date_trunc('hour', now()) ELSE NULL END,
      _referral_source, _ambassador_code, _device_type, _duration_seconds, _vw_coherent
    );
    RETURN;
  END IF;

  -- Finished questionnaires are immutable.
  IF existing.completed THEN
    RETURN;
  END IF;

  UPDATE public.survey_responses SET
    track = _track,
    language = coalesce(_language, language),
    answers = coalesce(_answers, answers),
    last_step = greatest(_last_step, last_step),
    total_steps = coalesce(nullif(_total_steps,0), total_steps),
    completed = coalesce(_completed, false),
    completed_at = CASE WHEN _completed THEN date_trunc('hour', now()) ELSE NULL END,
    referral_source = coalesce(_referral_source, referral_source),
    ambassador_code = coalesce(_ambassador_code, ambassador_code),
    device_type = coalesce(_device_type, device_type),
    duration_seconds = coalesce(_duration_seconds, duration_seconds),
    vw_coherent = coalesce(_vw_coherent, vw_coherent)
  WHERE session_token = _session_token;
END;
$$;

REVOKE ALL ON FUNCTION public.survey_save(uuid,text,text,jsonb,integer,integer,boolean,text,text,text,integer,boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.survey_save(uuid,text,text,jsonb,integer,integer,boolean,text,text,text,integer,boolean) TO anon, authenticated;

-- 3. Fix the admin answer-distribution aggregate (previous version referenced a
--    non-existent aggregate and would have failed at runtime).
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

  SELECT coalesce(jsonb_object_agg(k, payload), '{}'::jsonb) INTO result
  FROM (
    SELECT k,
           jsonb_build_object(
             'n', sum(n),
             'distribution', jsonb_object_agg(val, n)
           ) AS payload
    FROM (
      SELECT kv.key AS k,
             trim(both '"' from kv.value::text) AS val,
             count(*) AS n
      FROM public.survey_responses r,
           LATERAL jsonb_each(r.answers) kv
      WHERE r.completed AND r.track = _track
        AND jsonb_typeof(kv.value) IN ('number','string','boolean')
      GROUP BY kv.key, trim(both '"' from kv.value::text)
    ) g
    GROUP BY k
  ) s;

  RETURN result;
END;
$$;