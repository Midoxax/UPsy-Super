-- Bookings: real slots, no double booking, pay at the session.
--
-- Clients request a slot; the specialist confirms or declines it; the
-- client pays the specialist at the session. Before this, the booking modal
-- offered whole availability windows as single times built in the
-- browser's timezone, nothing stopped two people booking the same hour,
-- and get_available_slots read the specialist's hours as UTC.
--
-- Times: specialists enter weekly hours in Morocco time (Africa/Casablanca),
-- so every conversion here goes through that zone.

-- 1. Open slots for one day, in Morocco time, minus anything already
-- requested, proposed or confirmed.
CREATE OR REPLACE FUNCTION public.get_open_slots(p_psychologist_id uuid, p_date date)
RETURNS TABLE (slot_start timestamptz, duration_minutes integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH windows AS (
    SELECT a.start_time, a.end_time,
           coalesce(a.session_duration_minutes, 50) AS dur
    FROM availability_slots a
    WHERE a.psychologist_id = p_psychologist_id
      AND a.day_of_week = extract(dow FROM p_date)::int
      AND a.is_available AND coalesce(a.is_active, true)
  ),
  candidates AS (
    SELECT ((p_date + w.start_time + make_interval(mins => k * w.dur))
              AT TIME ZONE 'Africa/Casablanca') AS slot_start, w.dur
    FROM windows w,
         generate_series(0, ((extract(epoch FROM (w.end_time - w.start_time)) / 60)::int - w.dur) / w.dur) AS k
  )
  SELECT c.slot_start, c.dur
  FROM candidates c
  WHERE c.slot_start > now()
    AND NOT EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.psychologist_id = p_psychologist_id
        AND b.status IN ('pending', 'proposed', 'confirmed')
        AND tstzrange(b.scheduled_at, b.scheduled_at + make_interval(mins => b.duration_minutes))
            && tstzrange(c.slot_start, c.slot_start + make_interval(mins => c.dur))
    )
  ORDER BY c.slot_start;
$$;
REVOKE ALL ON FUNCTION public.get_open_slots(uuid, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_open_slots(uuid, date) TO anon, authenticated;

-- 2. Every active booking must be free of overlaps, and a client's request
-- must be one of the specialist's open slots.
CREATE OR REPLACE FUNCTION public.bookings_slot_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _local timestamp;
BEGIN
  IF NEW.status NOT IN ('pending', 'proposed', 'confirmed') THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE'
     AND NEW.scheduled_at = OLD.scheduled_at
     AND NEW.duration_minutes = OLD.duration_minutes
     AND OLD.status IN ('pending', 'proposed', 'confirmed') THEN
    RETURN NEW;  -- nothing that affects the calendar changed
  END IF;

  -- Serialise bookings per specialist so two requests cannot both pass.
  PERFORM pg_advisory_xact_lock(hashtext('booking:' || NEW.psychologist_id::text));

  IF EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.psychologist_id = NEW.psychologist_id
      AND b.id <> NEW.id
      AND b.status IN ('pending', 'proposed', 'confirmed')
      AND tstzrange(b.scheduled_at, b.scheduled_at + make_interval(mins => b.duration_minutes))
          && tstzrange(NEW.scheduled_at, NEW.scheduled_at + make_interval(mins => NEW.duration_minutes))
  ) THEN
    RAISE EXCEPTION 'This time is no longer available. Please choose another slot.'
      USING ERRCODE = 'exclusion_violation';
  END IF;

  -- A client's own request: must be in the future and inside the
  -- specialist's hours, at the duration those hours define.
  IF TG_OP = 'INSERT'
     AND auth.uid() = NEW.patient_id
     AND auth.uid() IS DISTINCT FROM NEW.psychologist_id
     AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    IF NEW.scheduled_at <= now() THEN
      RAISE EXCEPTION 'This time has already passed.' USING ERRCODE = 'check_violation';
    END IF;
    _local := NEW.scheduled_at AT TIME ZONE 'Africa/Casablanca';
    IF NOT EXISTS (
      SELECT 1 FROM availability_slots a
      WHERE a.psychologist_id = NEW.psychologist_id
        AND a.is_available AND coalesce(a.is_active, true)
        AND a.day_of_week = extract(dow FROM _local)::int
        AND coalesce(a.session_duration_minutes, 50) = NEW.duration_minutes
        AND _local::time >= a.start_time
        AND _local::time + make_interval(mins => NEW.duration_minutes) <= a.end_time
        AND extract(epoch FROM (_local::time - a.start_time))::int
            % (coalesce(a.session_duration_minutes, 50) * 60) = 0
    ) THEN
      RAISE EXCEPTION 'This time is outside the specialist''s hours.' USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_slot_guard_trg ON public.bookings;
CREATE TRIGGER bookings_slot_guard_trg
  BEFORE INSERT OR UPDATE OF scheduled_at, duration_minutes, status ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.bookings_slot_guard();

-- 3. In-app notifications for each step of a booking.
CREATE OR REPLACE FUNCTION public.bookings_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _when text := to_char(NEW.scheduled_at AT TIME ZONE 'Africa/Casablanca', 'DD/MM/YYYY HH24:MI');
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' AND NEW.patient_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, body, action_url, metadata)
    VALUES (NEW.psychologist_id, 'booking_requested', 'New session request',
            'A client asked for a session on ' || _when || ' (Morocco time). Confirm or decline it in your dashboard.',
            '/dashboard/specialist', jsonb_build_object('booking_id', NEW.id));
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'confirmed' AND NEW.patient_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, type, title, body, action_url, metadata)
      VALUES (NEW.patient_id, 'booking_confirmed', 'Session confirmed',
              'Your session on ' || _when || ' (Morocco time) is confirmed. You pay your specialist at the session.',
              '/dashboard/client', jsonb_build_object('booking_id', NEW.id));
    ELSIF NEW.status = 'cancelled' THEN
      INSERT INTO notifications (user_id, type, title, body, action_url, metadata)
      SELECT u, 'booking_cancelled', 'Session cancelled',
             'The session on ' || _when || ' (Morocco time) was cancelled.'
               || coalesce(' Reason: ' || NEW.decline_reason, ''),
             CASE WHEN u = NEW.psychologist_id THEN '/dashboard/specialist' ELSE '/dashboard/client' END,
             jsonb_build_object('booking_id', NEW.id)
      FROM unnest(ARRAY[NEW.patient_id, NEW.psychologist_id]) AS u
      WHERE u IS NOT NULL AND u IS DISTINCT FROM auth.uid();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_notify_trg ON public.bookings;
CREATE TRIGGER bookings_notify_trg
  AFTER INSERT OR UPDATE OF status ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.bookings_notify();

-- 4. A confirmed booking is a session. Session notes, treatment plans,
-- homework and progress all hang off `sessions`, which bookings never
-- filled, so specialists had nowhere to write about a booked session. Each
-- booking, once confirmed, is mirrored there under the same id and kept in
-- step with the booking's status and time.
CREATE OR REPLACE FUNCTION public.bookings_sync_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.patient_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.status IN ('confirmed', 'completed', 'no_show')
     OR EXISTS (SELECT 1 FROM sessions WHERE id = NEW.id) THEN
    INSERT INTO sessions (id, client_id, psychologist_id, date_time, duration_minutes,
                          status, session_type, video_room_id)
    VALUES (NEW.id, NEW.patient_id, NEW.psychologist_id, NEW.scheduled_at,
            coalesce(NEW.duration_minutes, 50), NEW.status,
            CASE NEW.session_type WHEN 'in_person' THEN 'in_person' ELSE 'online' END,
            NEW.video_room_id)
    ON CONFLICT (id) DO UPDATE
      SET date_time = EXCLUDED.date_time,
          duration_minutes = EXCLUDED.duration_minutes,
          status = EXCLUDED.status,
          session_type = EXCLUDED.session_type,
          video_room_id = EXCLUDED.video_room_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_sync_session_trg ON public.bookings;
CREATE TRIGGER bookings_sync_session_trg
  AFTER INSERT OR UPDATE OF status, scheduled_at, duration_minutes, session_type, video_room_id
  ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.bookings_sync_session();

INSERT INTO public.sessions (id, client_id, psychologist_id, date_time, duration_minutes,
                             status, session_type, video_room_id)
SELECT b.id, b.patient_id, b.psychologist_id, b.scheduled_at, coalesce(b.duration_minutes, 50),
       b.status, CASE b.session_type WHEN 'in_person' THEN 'in_person' ELSE 'online' END,
       b.video_room_id
FROM public.bookings b
WHERE b.patient_id IS NOT NULL AND b.status IN ('confirmed', 'completed', 'no_show')
  AND EXISTS (SELECT 1 FROM public.psychologist_profiles p WHERE p.id = b.psychologist_id)
ON CONFLICT (id) DO NOTHING;
