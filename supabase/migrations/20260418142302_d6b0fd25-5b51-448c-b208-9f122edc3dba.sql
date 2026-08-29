-- Phase 3: Mental Performance Score RPC
CREATE OR REPLACE FUNCTION public.compute_mps(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mood numeric := 0;
  v_consistency numeric := 0;
  v_engagement numeric := 0;
  v_recovery numeric := 0;
  v_growth numeric := 0;
  v_total numeric := 0;
  v_mood_count int;
  v_streak int := 0;
  v_assessments int;
  v_sessions int;
  v_prev_mood numeric;
  v_curr_mood numeric;
  v_delta numeric := 0;
BEGIN
  -- Mood (0-100): avg mood over last 14 days mapped 1-5 -> 0-100
  SELECT
    COALESCE(AVG(mood_score) * 20, 50)::numeric,
    COUNT(*)::int
  INTO v_curr_mood, v_mood_count
  FROM mood_entries
  WHERE user_id = _user_id
    AND recorded_at >= now() - interval '14 days';
  v_mood := COALESCE(v_curr_mood, 50);

  -- Consistency (0-100): days with check-in last 14 days * (100/14)
  SELECT (COUNT(DISTINCT DATE(recorded_at)) * (100.0/14))::numeric
  INTO v_consistency
  FROM mood_entries
  WHERE user_id = _user_id
    AND recorded_at >= now() - interval '14 days';
  v_consistency := LEAST(COALESCE(v_consistency, 0), 100);

  -- Engagement (0-100): sessions completed last 30d * 25 (cap 100)
  SELECT LEAST(COUNT(*) * 25, 100)::numeric
  INTO v_engagement
  FROM sessions
  WHERE client_id = _user_id
    AND status = 'completed'
    AND date_time >= now() - interval '30 days';

  -- Recovery (0-100): inverse of avg stress last 14 days
  SELECT COALESCE(100 - (AVG(stress_level) * 20), 70)::numeric
  INTO v_recovery
  FROM mood_entries
  WHERE user_id = _user_id
    AND stress_level IS NOT NULL
    AND recorded_at >= now() - interval '14 days';
  v_recovery := COALESCE(v_recovery, 70);

  -- Growth (0-100): assessments + journals last 30d
  SELECT LEAST(
    (SELECT COUNT(*) FROM assessment_results WHERE user_id = _user_id AND completed_at >= now() - interval '30 days') * 30
    + (SELECT COUNT(*) FROM journal_entries WHERE user_id = _user_id AND created_at >= now() - interval '30 days') * 10,
    100
  )::numeric INTO v_growth;

  -- Weighted total: mood 30, consistency 20, engagement 20, recovery 15, growth 15
  v_total := (v_mood * 0.30) + (v_consistency * 0.20) + (v_engagement * 0.20) + (v_recovery * 0.15) + (v_growth * 0.15);

  -- Week-over-week delta on total (compare last 7d vs prev 7d mood)
  SELECT COALESCE(AVG(mood_score) * 20, NULL)
  INTO v_prev_mood
  FROM mood_entries
  WHERE user_id = _user_id
    AND recorded_at >= now() - interval '14 days'
    AND recorded_at < now() - interval '7 days';
  IF v_prev_mood IS NOT NULL THEN
    v_delta := v_mood - v_prev_mood;
  END IF;

  RETURN jsonb_build_object(
    'total', ROUND(v_total)::int,
    'dimensions', jsonb_build_object(
      'mood', ROUND(v_mood)::int,
      'consistency', ROUND(v_consistency)::int,
      'engagement', ROUND(v_engagement)::int,
      'recovery', ROUND(v_recovery)::int,
      'growth', ROUND(v_growth)::int
    ),
    'delta', ROUND(v_delta)::int,
    'sample_size', v_mood_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.compute_mps(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.compute_mps(uuid) TO authenticated;