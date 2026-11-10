-- Live classes: only specialists/admins host; registration enforces consent
-- and capacity; participants cannot read others' data; the host sees the
-- roster; recordings are read-only outside classification fields.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-00000000a001', 'live-host@test'),
  ('00000000-0000-0000-0000-00000000a002', 'live-p1@test'),
  ('00000000-0000-0000-0000-00000000a003', 'live-p2@test');
INSERT INTO public.user_roles (user_id, role)
  VALUES ('00000000-0000-0000-0000-00000000a001', 'psychologist') ON CONFLICT DO NOTHING;

SET LOCAL ROLE authenticated;

-- A plain user cannot create a class.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a002', true);
DO $$ BEGIN
  INSERT INTO public.live_classes (title, host_id, starts_at)
  VALUES ('x', '00000000-0000-0000-0000-00000000a002', now() + interval '1 day');
  RAISE EXCEPTION 'FAILED: a plain user created a class';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: plain users cannot host';
END $$;

-- The specialist creates a recorded class with one seat.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a001', true);
INSERT INTO public.live_classes (id, title, host_id, starts_at, capacity, is_published)
VALUES ('00000000-0000-0000-0000-00000000c1a5', 'Live CBT', '00000000-0000-0000-0000-00000000a001',
        now() + interval '1 day', 1, true);

-- Participant 1: consent is required for a recorded class.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a002', true);
SELECT pg_temp.expect(public.register_live_class('00000000-0000-0000-0000-00000000c1a5', false) = 'consent_required',
  'a recorded class needs recording consent');
SELECT pg_temp.expect(public.register_live_class('00000000-0000-0000-0000-00000000c1a5', true) = 'registered',
  'registration with consent succeeds');

-- Participant 2: the class is full; cannot see participant 1's registration.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a003', true);
SELECT pg_temp.expect(public.register_live_class('00000000-0000-0000-0000-00000000c1a5', true) = 'full',
  'capacity is enforced');
SELECT pg_temp.expect((SELECT count(*) = 0 FROM public.live_class_registrations),
  'participants cannot see other registrations');
DO $$ BEGIN
  PERFORM * FROM public.live_class_roster('00000000-0000-0000-0000-00000000c1a5');
  RAISE EXCEPTION 'FAILED: a participant read the roster';
EXCEPTION WHEN raise_exception THEN
  IF SQLERRM LIKE 'FAILED%' THEN RAISE; END IF;
  RAISE NOTICE 'ok: the roster is for the host only';
END $$;

-- The host sees the roster with consent recorded.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a001', true);
SELECT pg_temp.expect((SELECT count(*) = 1 AND bool_and(recording_consent_at IS NOT NULL)
  FROM public.live_class_roster('00000000-0000-0000-0000-00000000c1a5')),
  'the host sees the roster with consent');

-- Recordings: the host can classify but not repoint storage.
RESET ROLE;
INSERT INTO public.live_class_recordings (id, class_id, status, storage_path)
VALUES ('00000000-0000-0000-0000-00000000ec01', '00000000-0000-0000-0000-00000000c1a5', 'stored', 'c/r.mp4');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a001', true);
UPDATE public.live_class_recordings SET category = 'cbt', tags = '{anxiety}', is_published = true
  WHERE id = '00000000-0000-0000-0000-00000000ec01';
SELECT pg_temp.expect((SELECT category = 'cbt' FROM public.live_class_recordings
  WHERE id = '00000000-0000-0000-0000-00000000ec01'), 'the host classifies a recording');
DO $$ BEGIN
  UPDATE public.live_class_recordings SET storage_path = 'other/x.mp4'
    WHERE id = '00000000-0000-0000-0000-00000000ec01';
  RAISE EXCEPTION 'FAILED: storage path changed';
EXCEPTION WHEN raise_exception THEN
  IF SQLERRM LIKE 'FAILED%' THEN RAISE; END IF;
  RAISE NOTICE 'ok: storage fields are locked';
END $$;

-- The registered participant sees the published recording; the other does not.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a002', true);
SELECT pg_temp.expect((SELECT count(*) = 1 FROM public.live_class_recordings),
  'a registered participant sees the published recording');
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a003', true);
SELECT pg_temp.expect((SELECT count(*) = 0 FROM public.live_class_recordings),
  'an unregistered user does not');

ROLLBACK;
