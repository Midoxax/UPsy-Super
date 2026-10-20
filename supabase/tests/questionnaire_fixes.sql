-- Behaviour test for 20261020170000_questionnaire_fixes.sql.
-- Runs against a database with every migration applied (see
-- scripts/db-test.sh). Any failed expectation raises and aborts.
\set ON_ERROR_STOP 1
BEGIN;

-- Fixtures (as the table owner, so RLS does not apply while seeding).
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-0000000001a1', 'admin@q.test'),
  ('00000000-0000-0000-0000-0000000001b1', 'psy@q.test'),
  ('00000000-0000-0000-0000-0000000001b2', 'otherpsy@q.test'),
  ('00000000-0000-0000-0000-0000000001c1', 'client@q.test');
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-0000000001a1', 'admin')
ON CONFLICT DO NOTHING;
INSERT INTO public.psychologist_profiles (id, full_name, slug) VALUES
  ('00000000-0000-0000-0000-0000000001b1', 'Dr Q', 'dr-q-test'),
  ('00000000-0000-0000-0000-0000000001b2', 'Dr Other', 'dr-other-q-test');
INSERT INTO public.bookings (id, psychologist_id, patient_id, scheduled_at) VALUES
  ('00000000-0000-0000-0000-0000000001d1', '00000000-0000-0000-0000-0000000001b1',
   '00000000-0000-0000-0000-0000000001c1', now() + interval '2 days');
INSERT INTO public.client_anamneses (id, client_id, psychologist_id, booking_id, status, completed_at, shared_with_psy_at)
  VALUES ('00000000-0000-0000-0000-0000000001e1', '00000000-0000-0000-0000-0000000001c1',
          '00000000-0000-0000-0000-0000000001b1', '00000000-0000-0000-0000-0000000001d1',
          'completed', now(), now());

CREATE FUNCTION pg_temp.as_user(_id uuid) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', _id::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  EXECUTE 'SET LOCAL ROLE authenticated';
END $$;
CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated;

-- A psychologist's direct UPDATE still matches nothing (SELECT-only policy).
SELECT pg_temp.as_user('00000000-0000-0000-0000-0000000001b1');
WITH u AS (
  UPDATE public.client_anamneses SET status = 'reviewed'
   WHERE id = '00000000-0000-0000-0000-0000000001e1' RETURNING 1)
SELECT pg_temp.expect((SELECT count(*) FROM u) = 0, 'psychologist cannot update the anamnesis directly');

-- Another psychologist is refused by the RPC.
RESET ROLE;
SELECT pg_temp.as_user('00000000-0000-0000-0000-0000000001b2');
DO $$ BEGIN
  PERFORM public.mark_anamnesis_reviewed('00000000-0000-0000-0000-0000000001e1');
  RAISE EXCEPTION 'FAILED: unrelated psychologist could mark reviewed';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: unrelated psychologist refused'; END $$;

-- The client's psychologist can mark it reviewed, with notes.
RESET ROLE;
SELECT pg_temp.as_user('00000000-0000-0000-0000-0000000001b1');
SELECT public.mark_anamnesis_reviewed('00000000-0000-0000-0000-0000000001e1', 'seen before session');
RESET ROLE;
SELECT pg_temp.expect(
  (SELECT status = 'reviewed' AND reviewed_at IS NOT NULL
          AND goals->>'review_notes' = 'seen before session'
     FROM public.client_anamneses WHERE id = '00000000-0000-0000-0000-0000000001e1'),
  'own psychologist marks the anamnesis reviewed');

-- anon cannot call it at all.
SELECT pg_temp.expect(
  NOT has_function_privilege('anon', 'public.mark_anamnesis_reviewed(uuid, text)', 'EXECUTE'),
  'anon cannot execute mark_anamnesis_reviewed');

-- Crisis alert inserted by the client notifies the psychologist and admins.
SELECT pg_temp.as_user('00000000-0000-0000-0000-0000000001c1');
INSERT INTO public.crisis_alerts (client_id, intake_form_id, alert_type, severity, source_section, source_value)
  VALUES ('00000000-0000-0000-0000-0000000001c1', '00000000-0000-0000-0000-0000000001e1',
          'crisis_suicide_ideation', 'critical', 'phq9_item_9', '3');
RESET ROLE;
SELECT pg_temp.expect(
  (SELECT count(*) FROM public.notifications
    WHERE user_id = '00000000-0000-0000-0000-0000000001b1' AND type = 'crisis_alert') = 1,
  'crisis alert notifies the client''s psychologist');
SELECT pg_temp.expect(
  (SELECT count(*) FROM public.notifications
    WHERE user_id = '00000000-0000-0000-0000-0000000001a1' AND type = 'crisis_alert') = 1,
  'crisis alert notifies admins');
SELECT pg_temp.expect(
  NOT EXISTS (SELECT 1 FROM public.notifications
               WHERE user_id = '00000000-0000-0000-0000-0000000001b2' AND type = 'crisis_alert'),
  'unrelated psychologist is not notified');
SELECT pg_temp.expect(
  NOT EXISTS (SELECT 1 FROM public.notifications
               WHERE type = 'crisis_alert'
                 AND (body ~ 'phq|PHQ|item|[0-9]' OR metadata ? 'source_value')),
  'crisis notification carries no clinical details');
SELECT pg_temp.expect(
  (SELECT notified_psy AND notified_admin FROM public.crisis_alerts
    WHERE client_id = '00000000-0000-0000-0000-0000000001c1'),
  'crisis alert marked as notified');

-- A forged intake/booking reference cannot route the alert to another psy.
INSERT INTO public.bookings (id, psychologist_id, patient_id, scheduled_at) VALUES
  ('00000000-0000-0000-0000-0000000001d2', '00000000-0000-0000-0000-0000000001b2',
   '00000000-0000-0000-0000-0000000001a1', now());
SELECT pg_temp.as_user('00000000-0000-0000-0000-0000000001c1');
INSERT INTO public.crisis_alerts (client_id, booking_id, alert_type)
  VALUES ('00000000-0000-0000-0000-0000000001c1', '00000000-0000-0000-0000-0000000001d2', 'test');
RESET ROLE;
SELECT pg_temp.expect(
  NOT EXISTS (SELECT 1 FROM public.notifications
               WHERE user_id = '00000000-0000-0000-0000-0000000001b2' AND type = 'crisis_alert'),
  'another client''s booking does not route the alert');

ROLLBACK;
