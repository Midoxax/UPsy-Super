-- ─────────────────────────────────────────────────────────────────────────────
-- Funnel & experiment analytics: funnel_events, experiment_winners, RPCs.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. funnel_events -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.funnel_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id text,
  variant       text,
  step          text NOT NULL,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_content   text,
  session_token text,
  contact_id    uuid,
  user_id       uuid,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS funnel_events_exp_idx     ON public.funnel_events (experiment_id, variant, created_at DESC);
CREATE INDEX IF NOT EXISTS funnel_events_step_idx    ON public.funnel_events (step, created_at DESC);
CREATE INDEX IF NOT EXISTS funnel_events_session_idx ON public.funnel_events (session_token);
CREATE INDEX IF NOT EXISTS funnel_events_utm_idx     ON public.funnel_events (utm_source, utm_campaign, created_at DESC);
CREATE INDEX IF NOT EXISTS funnel_events_contact_idx ON public.funnel_events (contact_id);

GRANT SELECT ON public.funnel_events TO authenticated;
GRANT INSERT ON public.funnel_events TO authenticated, anon;
GRANT ALL ON public.funnel_events TO service_role;
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

-- Admins read everything; everyone can append (capture is server-side, no PII).
DROP POLICY IF EXISTS "Admins read funnel events" ON public.funnel_events;
CREATE POLICY "Admins read funnel events" ON public.funnel_events
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone appends funnel events" ON public.funnel_events;
CREATE POLICY "Anyone appends funnel events" ON public.funnel_events
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

-- 2. experiment_winners ------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.experiment_winners (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id    text NOT NULL,
  winning_variant  text NOT NULL,
  traffic_per_arm  integer,
  control_rate     double precision,
  winner_rate      double precision,
  lift_pct         double precision,
  confidence       double precision,
  promoted_by      uuid,
  auto             boolean NOT NULL DEFAULT false,
  decided_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (experiment_id)
);

GRANT SELECT ON public.experiment_winners TO authenticated;
GRANT ALL ON public.experiment_winners TO service_role;
ALTER TABLE public.experiment_winners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage experiment winners" ON public.experiment_winners;
CREATE POLICY "Admins manage experiment winners" ON public.experiment_winners
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. funnel_metrics(from, to) ------------------------------------------------
CREATE OR REPLACE FUNCTION public.funnel_metrics(_from timestamptz DEFAULT now() - interval '30 days', _to timestamptz DEFAULT now())
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_out jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT jsonb_build_object(
    'by_variant', (
      SELECT COALESCE(jsonb_agg(row_to_json(t) ORDER BY t.variant), '[]'::jsonb)
      FROM (
        SELECT variant,
               count(*) AS events,
               count(DISTINCT session_token) AS sessions,
               count(DISTINCT contact_id) AS contacts,
               count(*) FILTER (WHERE step IN ('signup','booking_confirmed')) AS conversions
        FROM public.funnel_events
        WHERE created_at >= _from AND created_at <= _to
          AND experiment_id = 'home_hero_v1'
        GROUP BY variant
      ) t
    ),
    'by_step', (
      SELECT COALESCE(jsonb_object_agg(step, n), '{}'::jsonb)
      FROM (SELECT step, count(*) n FROM public.funnel_events
            WHERE created_at >= _from AND created_at <= _to GROUP BY step) s
    ),
    'by_utm_source', (
      SELECT COALESCE(jsonb_object_agg(utm_source, n), '{}'::jsonb)
      FROM (SELECT COALESCE(utm_source,'(direct)') utm_source, count(*) n
            FROM public.funnel_events
            WHERE created_at >= _from AND created_at <= _to GROUP BY 1) u
    ),
    'by_utm_campaign', (
      SELECT COALESCE(jsonb_object_agg(utm_campaign, n), '{}'::jsonb)
      FROM (SELECT COALESCE(utm_campaign,'(none)') utm_campaign, count(*) n
            FROM public.funnel_events
            WHERE created_at >= _from AND created_at <= _to GROUP BY 1) u
    )
  ) INTO v_out;

  RETURN v_out;
END;
$$;

GRANT EXECUTE ON FUNCTION public.funnel_metrics(timestamptz, timestamptz) TO authenticated;

-- 4. observatoire_funnel_report(days) -----------------------------------------
CREATE OR REPLACE FUNCTION public.observatoire_funnel_report(_days integer DEFAULT 7)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_since timestamptz := now() - make_interval(days => LEAST(GREATEST(COALESCE(_days,7),1),90));
  v_out jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT jsonb_build_object(
    'starts',        (SELECT count(*) FROM public.survey_responses WHERE created_at >= v_since),
    'in_progress',   (SELECT count(*) FROM public.survey_responses WHERE created_at >= v_since AND completed = false),
    'completions',   (SELECT count(*) FROM public.survey_responses WHERE created_at >= v_since AND completed = true),
    'opt_ins',       (SELECT count(*) FROM public.growth_leads WHERE created_at >= v_since AND source = 'observatoire'),
    'crm_tagged',    (SELECT count(*) FROM public.crm_contacts WHERE created_at >= v_since AND source = 'observatoire'),
    'by_track', (
      SELECT COALESCE(jsonb_object_agg(track, n), '{}'::jsonb)
      FROM (SELECT track, count(*) n FROM public.survey_responses
            WHERE created_at >= v_since GROUP BY track) t
    ),
    'completion_rate',
      CASE WHEN (SELECT count(*) FROM public.survey_responses WHERE created_at >= v_since) = 0 THEN 0
           ELSE round(100.0 * (SELECT count(*) FROM public.survey_responses WHERE created_at >= v_since AND completed = true)
                      / (SELECT count(*) FROM public.survey_responses WHERE created_at >= v_since), 1)
      END,
    'opt_in_rate',
      CASE WHEN (SELECT count(*) FROM public.survey_responses WHERE created_at >= v_since AND completed = true) = 0 THEN 0
           ELSE round(100.0 * (SELECT count(*) FROM public.growth_leads WHERE created_at >= v_since AND source = 'observatoire')
                      / GREATEST((SELECT count(*) FROM public.survey_responses WHERE created_at >= v_since AND completed = true),1), 1)
      END
  ) INTO v_out;

  RETURN v_out;
END;
$$;

GRANT EXECUTE ON FUNCTION public.observatoire_funnel_report(integer) TO authenticated;

-- 5. home_hero_winner() -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.home_hero_winner()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ctrl_n   integer;
  v_ctrl_c   integer;
  v          text;
  v_n        integer;
  v_c        integer;
  v_p1       double precision;
  v_p2       double precision;
  v_pool     double precision;
  v_se       double precision;
  v_z        double precision;
  v_lift     double precision;
  v_best     text;
  v_best_z   double precision := 0;
  v_best_p2  double precision;
  v_best_p1  double precision;
  v_best_n   integer;
  v_best_c   integer;
BEGIN
  IF EXISTS (SELECT 1 FROM public.experiment_winners WHERE experiment_id = 'home_hero_v1') THEN
    RETURN jsonb_build_object('status', 'promoted',
      'winner', (SELECT winning_variant FROM public.experiment_winners WHERE experiment_id = 'home_hero_v1'));
  END IF;

  -- Control arm traffic + conversions (session-distinct).
  SELECT count(DISTINCT session_token), count(DISTINCT session_token) FILTER (WHERE step IN ('signup','booking_confirmed'))
    INTO v_ctrl_n, v_ctrl_c
    FROM public.funnel_events
    WHERE experiment_id = 'home_hero_v1' AND variant = 'control';

  IF v_ctrl_n IS NULL OR v_ctrl_n < 500 THEN
    RETURN jsonb_build_object('status', 'inconclusive', 'reason', 'control_traffic', 'control_n', v_ctrl_n);
  END IF;

  v_p1 := v_ctrl_c::double precision / v_ctrl_n;

  FOR v IN SELECT unnest(ARRAY['clarity','offer']) LOOP
    SELECT count(DISTINCT session_token), count(DISTINCT session_token) FILTER (WHERE step IN ('signup','booking_confirmed'))
      INTO v_n, v_c
      FROM public.funnel_events
      WHERE experiment_id = 'home_hero_v1' AND variant = v;

    IF v_n IS NULL OR v_n < 500 THEN
      CONTINUE;
    END IF;

    v_p2 := v_c::double precision / v_n;
    v_pool := (v_ctrl_c + v_c)::double precision / (v_ctrl_n + v_n);
    v_se := sqrt(v_pool * (1 - v_pool) * (1.0/v_ctrl_n + 1.0/v_n));
    v_z := CASE WHEN v_se = 0 THEN 0 ELSE (v_p2 - v_p1) / v_se END;

    IF v_p2 > v_p1 AND v_z > v_best_z THEN
      v_best := v; v_best_z := v_z; v_best_p2 := v_p2; v_best_p1 := v_p1;
      v_best_n := v_n; v_best_c := v_c;
    END IF;
  END LOOP;

  IF v_best IS NULL THEN
    RETURN jsonb_build_object('status', 'inconclusive', 'reason', 'no_winner_above_control', 'control_n', v_ctrl_n, 'control_rate', round(v_p1,4));
  END IF;

  v_lift := (v_best_p2 - v_p1) / NULLIF(v_p1, 0);

  IF v_best_z >= 1.96 AND v_lift >= 0.10 THEN
    RETURN jsonb_build_object(
      'status', 'winner',
      'winner', v_best,
      'control_n', v_ctrl_n, 'control_conversions', v_ctrl_c, 'control_rate', round(v_p1,4),
      'winner_n', v_best_n, 'winner_conversions', v_best_c, 'winner_rate', round(v_best_p2,4),
      'lift_pct', round(v_lift * 100, 1),
      'confidence', round(v_best_z, 3)
    );
  END IF;

  RETURN jsonb_build_object('status', 'inconclusive', 'reason', 'not_significant',
    'control_rate', round(v_p1,4), 'best', v_best, 'best_z', round(v_best_z,3), 'lift_pct', round(v_lift * 100, 1));
END;
$$;

GRANT EXECUTE ON FUNCTION public.home_hero_winner() TO authenticated;

-- 6. home_hero_forced_variant() ----------------------------------------------
CREATE OR REPLACE FUNCTION public.home_hero_forced_variant()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT winning_variant FROM public.experiment_winners WHERE experiment_id = 'home_hero_v1' LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.home_hero_forced_variant() TO authenticated, anon;

-- 7. promote_home_hero_winner(auto) -------------------------------------------
CREATE OR REPLACE FUNCTION public.promote_home_hero_winner(_auto boolean DEFAULT true)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_decision jsonb;
  v_status  text;
  v_winner  text;
BEGIN
  IF EXISTS (SELECT 1 FROM public.experiment_winners WHERE experiment_id = 'home_hero_v1') THEN
    RETURN jsonb_build_object('status', 'already_promoted',
      'winner', (SELECT winning_variant FROM public.experiment_winners WHERE experiment_id = 'home_hero_v1'));
  END IF;

  v_decision := public.home_hero_winner();
  v_status := v_decision->>'status';

  IF v_status = 'winner' THEN
    v_winner := v_decision->>'winner';
    INSERT INTO public.experiment_winners
      (experiment_id, winning_variant, traffic_per_arm, control_rate, winner_rate, lift_pct, confidence, promoted_by, auto)
    VALUES ('home_hero_v1', v_winner,
      (v_decision->>'winner_n')::integer,
      (v_decision->>'control_rate')::double precision,
      (v_decision->>'winner_rate')::double precision,
      (v_decision->>'lift_pct')::double precision,
      (v_decision->>'confidence')::double precision,
      auth.uid(), _auto);
    RETURN jsonb_build_object('status', 'promoted', 'winner', v_winner, 'decision', v_decision);
  END IF;

  RETURN v_decision;
END;
$$;

GRANT EXECUTE ON FUNCTION public.promote_home_hero_winner(boolean) TO authenticated;

-- 8. Nightly auto-promote via pg_cron -----------------------------------------
DO $$
BEGIN
  PERFORM cron.unschedule('home-hero-auto-promote');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.schedule('home-hero-auto-promote', '17 2 * * *', 'SELECT public.promote_home_hero_winner(true);');
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'home-hero auto-promote cron not scheduled: %', SQLERRM;
END $$;
