-- Behaviour test for 20261021090000_account_links.sql.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;

INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('00000000-0000-0000-0000-0000000009a1', 'new@links.test', '{"full_name":"New Person"}'),
  ('00000000-0000-0000-0000-0000000009a2', 'psy@links.test', '{}'),
  ('00000000-0000-0000-0000-0000000009a3', 'psy2@links.test', '{}');

SELECT pg_temp.expect((SELECT full_name FROM public.profiles WHERE id = '00000000-0000-0000-0000-0000000009a1') = 'New Person',
  'signup creates a profile');
SELECT pg_temp.expect(EXISTS (SELECT 1 FROM public.user_memberships
  WHERE user_id = '00000000-0000-0000-0000-0000000009a1' AND tier = 'discover'),
  'signup grants the default membership');

-- A profile id change carries its slots along.
INSERT INTO public.psychologist_profiles (id, full_name) VALUES ('00000000-0000-0000-0000-0000000009a2', 'Psy');
INSERT INTO public.availability_slots (psychologist_id, day_of_week, start_time, end_time)
  VALUES ('00000000-0000-0000-0000-0000000009a2', 1, '09:00', '12:00');
UPDATE public.psychologist_profiles SET id = '00000000-0000-0000-0000-0000000009a3'
  WHERE id = '00000000-0000-0000-0000-0000000009a2';
SELECT pg_temp.expect((SELECT psychologist_id FROM public.availability_slots WHERE day_of_week = 1
  AND start_time = '09:00' AND end_time = '12:00' LIMIT 1) = '00000000-0000-0000-0000-0000000009a3',
  'slots follow a profile id change');

DO $$ BEGIN
  INSERT INTO public.psychologist_profiles (id, full_name) VALUES (gen_random_uuid(), 'Ghost');
  RAISE EXCEPTION 'FAILED: created a profile with no account';
EXCEPTION WHEN foreign_key_violation THEN RAISE NOTICE 'ok: a profile needs an account'; END $$;

ROLLBACK;
