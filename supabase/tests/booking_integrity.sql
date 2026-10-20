-- Behaviour test for 20261020130000_booking_integrity.sql.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated;
-- Tomorrow 10:00 Morocco time, as a timestamptz.
CREATE FUNCTION pg_temp.at(_hhmm text) RETURNS timestamptz LANGUAGE sql AS $$
  SELECT (((now() AT TIME ZONE 'Africa/Casablanca')::date + 1) + _hhmm::time) AT TIME ZONE 'Africa/Casablanca' $$;
GRANT EXECUTE ON FUNCTION pg_temp.at(text) TO authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-0000000005a1', 'psy@book.test'),
  ('00000000-0000-0000-0000-0000000005b1', 'c1@book.test'),
  ('00000000-0000-0000-0000-0000000005b2', 'c2@book.test');
INSERT INTO public.psychologist_profiles (id, full_name, slug, hourly_rate_mad, is_published, is_accredited)
  VALUES ('00000000-0000-0000-0000-0000000005a1', 'Dr Book', 'dr-book', 600, true, true);
INSERT INTO public.availability_slots (psychologist_id, day_of_week, start_time, end_time, is_available, session_duration_minutes)
  VALUES ('00000000-0000-0000-0000-0000000005a1',
          extract(dow FROM (now() AT TIME ZONE 'Africa/Casablanca')::date + 1)::int,
          '09:00', '12:00', true, 60);

SELECT pg_temp.expect((SELECT count(*) FROM public.get_open_slots('00000000-0000-0000-0000-0000000005a1',
  (now() AT TIME ZONE 'Africa/Casablanca')::date + 1)) = 3, 'three hour-long slots in a 9-12 window');
SELECT pg_temp.expect((SELECT min(slot_start) FROM public.get_open_slots('00000000-0000-0000-0000-0000000005a1',
  (now() AT TIME ZONE 'Africa/Casablanca')::date + 1)) = pg_temp.at('09:00'), 'slots are in Morocco time');

-- Client 1 books 10:00.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000005b1', true);
SET LOCAL ROLE authenticated;
INSERT INTO public.bookings (psychologist_id, patient_id, scheduled_at, duration_minutes, session_type, amount_mad)
  VALUES ('00000000-0000-0000-0000-0000000005a1', '00000000-0000-0000-0000-0000000005b1', pg_temp.at('10:00'), 60, 'video', 600);
RESET ROLE;
SELECT pg_temp.expect((SELECT status FROM public.bookings WHERE patient_id = '00000000-0000-0000-0000-0000000005b1') = 'pending',
  'request is pending until the specialist confirms');
SELECT pg_temp.expect((SELECT count(*) FROM public.notifications WHERE user_id = '00000000-0000-0000-0000-0000000005a1'
  AND type = 'booking_requested') = 1, 'specialist is notified of the request');
SELECT pg_temp.expect((SELECT count(*) FROM public.get_open_slots('00000000-0000-0000-0000-0000000005a1',
  (now() AT TIME ZONE 'Africa/Casablanca')::date + 1)) = 2, 'the requested slot is no longer offered');

-- Client 2 cannot take it, nor book off-grid or outside the hours.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000005b2', true);
SET LOCAL ROLE authenticated;
DO $$ BEGIN
  INSERT INTO public.bookings (psychologist_id, patient_id, scheduled_at, duration_minutes, session_type, amount_mad)
    VALUES ('00000000-0000-0000-0000-0000000005a1', '00000000-0000-0000-0000-0000000005b2', pg_temp.at('10:00'), 60, 'video', 600);
  RAISE EXCEPTION 'FAILED: double booking accepted';
EXCEPTION WHEN exclusion_violation THEN RAISE NOTICE 'ok: double booking refused'; END $$;
DO $$ BEGIN
  INSERT INTO public.bookings (psychologist_id, patient_id, scheduled_at, duration_minutes, session_type, amount_mad)
    VALUES ('00000000-0000-0000-0000-0000000005a1', '00000000-0000-0000-0000-0000000005b2', pg_temp.at('10:30'), 60, 'video', 600);
  RAISE EXCEPTION 'FAILED: overlapping booking accepted';
EXCEPTION WHEN exclusion_violation THEN RAISE NOTICE 'ok: overlap refused'; END $$;
DO $$ BEGIN
  INSERT INTO public.bookings (psychologist_id, patient_id, scheduled_at, duration_minutes, session_type, amount_mad)
    VALUES ('00000000-0000-0000-0000-0000000005a1', '00000000-0000-0000-0000-0000000005b2', pg_temp.at('07:00'), 60, 'video', 600);
  RAISE EXCEPTION 'FAILED: booking outside hours accepted';
EXCEPTION WHEN check_violation THEN RAISE NOTICE 'ok: outside hours refused'; END $$;
INSERT INTO public.bookings (psychologist_id, patient_id, scheduled_at, duration_minutes, session_type, amount_mad)
  VALUES ('00000000-0000-0000-0000-0000000005a1', '00000000-0000-0000-0000-0000000005b2', pg_temp.at('11:00'), 60, 'video', 600);
RESET ROLE;
SELECT pg_temp.expect((SELECT count(*) FROM public.bookings WHERE patient_id = '00000000-0000-0000-0000-0000000005b2') = 1,
  'a free slot can be booked');

-- Specialist confirms one, client 2 cancels theirs: each side hears about it.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000005a1', true);
SET LOCAL ROLE authenticated;
UPDATE public.bookings SET status = 'confirmed' WHERE patient_id = '00000000-0000-0000-0000-0000000005b1';
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000005b2', true);
UPDATE public.bookings SET status = 'cancelled' WHERE patient_id = '00000000-0000-0000-0000-0000000005b2';
RESET ROLE;
SELECT pg_temp.expect((SELECT count(*) FROM public.notifications WHERE user_id = '00000000-0000-0000-0000-0000000005b1'
  AND type = 'booking_confirmed') = 1, 'client is notified of the confirmation');
SELECT pg_temp.expect((SELECT count(*) FROM public.notifications WHERE user_id = '00000000-0000-0000-0000-0000000005a1'
  AND type = 'booking_cancelled') = 1, 'specialist is notified of the cancellation');
SELECT pg_temp.expect((SELECT count(*) FROM public.get_open_slots('00000000-0000-0000-0000-0000000005a1',
  (now() AT TIME ZONE 'Africa/Casablanca')::date + 1)) = 2, 'a cancelled slot is offered again');
SELECT pg_temp.expect((SELECT s.status FROM public.sessions s JOIN public.bookings b ON b.id = s.id
  WHERE b.patient_id = '00000000-0000-0000-0000-0000000005b1') = 'confirmed',
  'a confirmed booking becomes a session the specialist can write notes on');
SELECT pg_temp.expect(NOT EXISTS (SELECT 1 FROM public.sessions s JOIN public.bookings b ON b.id = s.id
  WHERE b.patient_id = '00000000-0000-0000-0000-0000000005b2'), 'unconfirmed requests are not sessions');
ROLLBACK;
