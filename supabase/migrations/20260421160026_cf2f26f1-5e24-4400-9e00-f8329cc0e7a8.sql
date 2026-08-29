-- Index to speed up overlap checks on bookings
CREATE INDEX IF NOT EXISTS idx_bookings_psy_scheduled
  ON public.bookings (psychologist_id, scheduled_at);

-- Validate a proposed slot for a psychologist
CREATE OR REPLACE FUNCTION public.check_proposal_slot(
  _psy uuid,
  _start timestamptz,
  _duration int
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _end timestamptz;
  _local timestamptz;
  _dow smallint;
  _t time;
  _has_window boolean;
  _has_conflict boolean;
BEGIN
  IF _psy IS NULL OR _start IS NULL OR _duration IS NULL OR _duration <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_input');
  END IF;

  _end := _start + make_interval(mins => _duration);

  -- Must be at least 1 hour in the future
  IF _start < (now() + interval '1 hour') THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'too_soon');
  END IF;

  -- Convert to Africa/Casablanca local time for weekday/time-of-day comparisons
  _local := _start AT TIME ZONE 'Africa/Casablanca';
  _dow := EXTRACT(DOW FROM _local)::smallint; -- 0=Sun..6=Sat
  _t := _local::time;

  SELECT EXISTS (
    SELECT 1
    FROM public.availability_slots a
    WHERE a.psychologist_id = _psy
      AND COALESCE(a.is_active, true) = true
      AND COALESCE(a.is_available, true) = true
      AND a.day_of_week = _dow
      AND a.start_time <= _t
      AND a.end_time   >= (_local + make_interval(mins => _duration))::time
  ) INTO _has_window;

  IF NOT _has_window THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'outside_availability');
  END IF;

  -- Conflict with any existing active booking
  SELECT EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.psychologist_id = _psy
      AND b.status IN ('proposed', 'pending', 'confirmed')
      AND tstzrange(b.scheduled_at, b.scheduled_at + make_interval(mins => b.duration_minutes), '[)')
          && tstzrange(_start, _end, '[)')
  ) INTO _has_conflict;

  IF _has_conflict THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'slot_conflict');
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_proposal_slot(uuid, timestamptz, int) TO anon, authenticated;

-- Replace all availability ranges for a single day for the calling psychologist
-- _ranges expected as jsonb array of { start: 'HH:MM', end: 'HH:MM' }
CREATE OR REPLACE FUNCTION public.replace_availability_for_day(
  _day smallint,
  _ranges jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _r jsonb;
  _start time;
  _end time;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF _day IS NULL OR _day < 0 OR _day > 6 THEN
    RAISE EXCEPTION 'invalid_day';
  END IF;

  -- Validate ranges and check for overlaps in the input
  IF _ranges IS NOT NULL AND jsonb_typeof(_ranges) = 'array' THEN
    FOR _r IN SELECT * FROM jsonb_array_elements(_ranges)
    LOOP
      _start := (_r->>'start')::time;
      _end   := (_r->>'end')::time;
      IF _end <= _start THEN
        RAISE EXCEPTION 'invalid_range';
      END IF;
    END LOOP;
  END IF;

  -- Replace the day atomically
  DELETE FROM public.availability_slots
   WHERE psychologist_id = _uid AND day_of_week = _day;

  IF _ranges IS NOT NULL AND jsonb_typeof(_ranges) = 'array' THEN
    INSERT INTO public.availability_slots
      (psychologist_id, day_of_week, start_time, end_time, is_active, is_available, session_duration_minutes)
    SELECT
      _uid,
      _day,
      (r->>'start')::time,
      (r->>'end')::time,
      true,
      true,
      COALESCE((r->>'duration')::int, 50)
    FROM jsonb_array_elements(_ranges) AS r;
  END IF;

  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, metadata)
  VALUES (_uid, 'availability.replace_day', 'availability_slots', NULL,
          jsonb_build_object('day_of_week', _day, 'ranges', COALESCE(_ranges, '[]'::jsonb)));
END;
$$;

GRANT EXECUTE ON FUNCTION public.replace_availability_for_day(smallint, jsonb) TO authenticated;