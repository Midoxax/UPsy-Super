-- Trainings: only admins build them; a certificate is issued only once every
-- required course is fully completed, once per learner; nobody can write a
-- certificate row directly any more.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-0000000d7001', 'trainee@test');

INSERT INTO public.courses (id, title, slug, is_published) VALUES
  ('00000000-0000-0000-0000-0000000dc001', 'Course A', 'test-course-a', true),
  ('00000000-0000-0000-0000-0000000dc002', 'Course B', 'test-course-b', true);
INSERT INTO public.course_modules (id, course_id, title, order_index) VALUES
  ('00000000-0000-0000-0000-0000000d0a01', '00000000-0000-0000-0000-0000000dc001', 'A1', 1),
  ('00000000-0000-0000-0000-0000000d0a02', '00000000-0000-0000-0000-0000000dc001', 'A2', 2),
  ('00000000-0000-0000-0000-0000000d0b01', '00000000-0000-0000-0000-0000000dc002', 'B1', 1);
INSERT INTO public.trainings (id, slug, title, cpd_hours, is_published) VALUES
  ('00000000-0000-0000-0000-0000000d7a01', 'test-path', 'Test path', 4, true),
  ('00000000-0000-0000-0000-0000000d7a02', 'test-hidden', 'Hidden path', NULL, false);
INSERT INTO public.training_courses (training_id, course_id, position) VALUES
  ('00000000-0000-0000-0000-0000000d7a01', '00000000-0000-0000-0000-0000000dc001', 1),
  ('00000000-0000-0000-0000-0000000d7a01', '00000000-0000-0000-0000-0000000dc002', 2);
-- Course A half done (stamped complete by the client, which must not count),
-- course B not started.
INSERT INTO public.course_enrollments (user_id, course_id, completed_modules, completed_at) VALUES
  ('00000000-0000-0000-0000-0000000d7001', '00000000-0000-0000-0000-0000000dc001',
   ARRAY['00000000-0000-0000-0000-0000000d0a01']::uuid[], now());

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000d7001', true);

SELECT pg_temp.expect((SELECT array_agg(slug) @> ARRAY['test-path'] AND NOT ('test-hidden' = ANY(array_agg(slug))) FROM public.trainings), 'only published trainings are listed');

DO $$ BEGIN
  INSERT INTO public.trainings (slug, title) VALUES ('mine', 'Mine');
  RAISE EXCEPTION 'FAILED: a learner created a training';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: learners cannot create trainings';
END $$;

DO $$ BEGIN
  INSERT INTO public.certificates (user_id, certificate_type, title, recipient_name)
  VALUES ('00000000-0000-0000-0000-0000000d7001', 'psychologist_accreditation', 'Fake', 'Me');
  RAISE EXCEPTION 'FAILED: a learner wrote their own certificate';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: certificates cannot be self-issued';
END $$;

DO $$ BEGIN
  PERFORM public.issue_training_certificate('00000000-0000-0000-0000-0000000d7a01');
  RAISE EXCEPTION 'FAILED: certificate issued for an unfinished training';
EXCEPTION WHEN raise_exception THEN
  IF SQLERRM <> 'incomplete' THEN RAISE; END IF;
  RAISE NOTICE 'ok: an unfinished training gives no certificate';
END $$;

DO $$ BEGIN
  PERFORM public.issue_training_certificate('00000000-0000-0000-0000-0000000d7a02');
  RAISE EXCEPTION 'FAILED: certificate issued for an unpublished training';
EXCEPTION WHEN raise_exception THEN
  IF SQLERRM <> 'not found' THEN RAISE; END IF;
  RAISE NOTICE 'ok: unpublished trainings give no certificate';
END $$;

-- Finish every module of both courses.
UPDATE public.course_enrollments SET completed_modules =
  ARRAY['00000000-0000-0000-0000-0000000d0a01', '00000000-0000-0000-0000-0000000d0a02']::uuid[]
  WHERE course_id = '00000000-0000-0000-0000-0000000dc001';
RESET ROLE;
INSERT INTO public.course_enrollments (user_id, course_id, completed_modules) VALUES
  ('00000000-0000-0000-0000-0000000d7001', '00000000-0000-0000-0000-0000000dc002',
   ARRAY['00000000-0000-0000-0000-0000000d0b01']::uuid[]);
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000d7001', true);

CREATE TEMP TABLE first_cert AS SELECT public.issue_training_certificate('00000000-0000-0000-0000-0000000d7a01') AS id;
SELECT pg_temp.expect((SELECT certificate_type = 'mooc_training' AND (metadata->>'cpd_hours')::numeric = 4
  FROM public.certificates WHERE id = (SELECT id FROM first_cert)), 'a completed training issues its certificate');
SELECT pg_temp.expect(public.issue_training_certificate('00000000-0000-0000-0000-0000000d7a01') = (SELECT id FROM first_cert),
  'asking again returns the same certificate');

ROLLBACK;
