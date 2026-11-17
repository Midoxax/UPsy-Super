-- Courses from series: only admins convert a series; the course is an
-- unpublished Academy draft with one module per recording, in series order,
-- each carrying its recording; converting twice returns the same course.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-00000000d001', 'cfs-admin@test'),
  ('00000000-0000-0000-0000-00000000d002', 'cfs-host@test');
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-00000000d001', 'admin'),
  ('00000000-0000-0000-0000-00000000d002', 'psychologist') ON CONFLICT DO NOTHING;

INSERT INTO public.live_classes (id, title, host_id, starts_at) VALUES
  ('00000000-0000-0000-0000-00000000dc01', 'Class', '00000000-0000-0000-0000-00000000d002', now() - interval '1 day');
INSERT INTO public.live_class_recordings (id, class_id, status, storage_path, title, title_fr) VALUES
  ('00000000-0000-0000-0000-00000000de01', '00000000-0000-0000-0000-00000000dc01', 'stored', 'x/1.mp4', 'Breathing', 'Respiration'),
  ('00000000-0000-0000-0000-00000000de02', '00000000-0000-0000-0000-00000000dc01', 'stored', 'x/2.mp4', 'Exposure', 'Exposition');
INSERT INTO public.live_series (id, title, title_fr, host_id) VALUES
  ('00000000-0000-0000-0000-00000000df01', 'Anxiety cycle', 'Cycle anxiété', '00000000-0000-0000-0000-00000000d002');
INSERT INTO public.live_series_items (series_id, recording_id, position, label_fr) VALUES
  ('00000000-0000-0000-0000-00000000df01', '00000000-0000-0000-0000-00000000de02', 2, NULL),
  ('00000000-0000-0000-0000-00000000df01', '00000000-0000-0000-0000-00000000de01', 1, 'Séance 1 : respirer');

SET LOCAL ROLE authenticated;

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000d002', true);
DO $$ BEGIN
  PERFORM public.course_from_live_series('00000000-0000-0000-0000-00000000df01');
  RAISE EXCEPTION 'FAILED: a host converted a series';
EXCEPTION WHEN raise_exception THEN
  IF SQLERRM LIKE 'FAILED%' THEN RAISE; END IF;
  RAISE NOTICE 'ok: only admins convert a series';
END $$;

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000d001', true);
CREATE TEMP TABLE made AS
  SELECT public.course_from_live_series('00000000-0000-0000-0000-00000000df01') AS id;
SELECT pg_temp.expect((SELECT NOT is_published AND is_academy_premium FROM public.courses
  WHERE id = (SELECT id FROM made)), 'the course is an unpublished Academy draft');
SELECT pg_temp.expect((SELECT array_agg(recording_id::text ORDER BY order_index) =
  ARRAY['00000000-0000-0000-0000-00000000de01', '00000000-0000-0000-0000-00000000de02']
  FROM public.course_modules WHERE course_id = (SELECT id FROM made)),
  'one module per recording, in series order');
SELECT pg_temp.expect((SELECT title_fr = 'Séance 1 : respirer' FROM public.course_modules
  WHERE course_id = (SELECT id FROM made) AND order_index = 1), 'the series label names the module');
SELECT pg_temp.expect(public.course_from_live_series('00000000-0000-0000-0000-00000000df01') = (SELECT id FROM made),
  'converting again returns the same course');
SELECT pg_temp.expect((SELECT count(*) = 2 FROM public.course_modules WHERE course_id = (SELECT id FROM made)),
  'and adds no modules');

ROLLBACK;
