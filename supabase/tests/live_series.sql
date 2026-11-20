-- Live series: hosts file only their own recordings into their own series;
-- publishing a series opens its recordings to Academy members and nobody
-- else; reordering is host-only.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-00000000b001', 'series-host@test'),
  ('00000000-0000-0000-0000-00000000b002', 'series-other-host@test'),
  ('00000000-0000-0000-0000-00000000b003', 'series-member@test'),
  ('00000000-0000-0000-0000-00000000b004', 'series-visitor@test');
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-00000000b001', 'psychologist'),
  ('00000000-0000-0000-0000-00000000b002', 'psychologist') ON CONFLICT DO NOTHING;
INSERT INTO public.all_access_subscriptions (user_id, status, current_period_end)
  VALUES ('00000000-0000-0000-0000-00000000b003', 'active', now() + interval '30 days');

-- Two hosts, one class each, one stored published recording each.
INSERT INTO public.live_classes (id, title, host_id, starts_at, is_published) VALUES
  ('00000000-0000-0000-0000-00000000c0a1', 'Host A class', '00000000-0000-0000-0000-00000000b001', now() - interval '2 days', true),
  ('00000000-0000-0000-0000-00000000c0a2', 'Host B class', '00000000-0000-0000-0000-00000000b002', now() - interval '2 days', true);
INSERT INTO public.live_class_recordings (id, class_id, status, storage_path, is_published) VALUES
  ('00000000-0000-0000-0000-00000000ec11', '00000000-0000-0000-0000-00000000c0a1', 'stored', 'a/1.mp4', true),
  ('00000000-0000-0000-0000-00000000ec12', '00000000-0000-0000-0000-00000000c0a1', 'stored', 'a/2.mp4', true),
  ('00000000-0000-0000-0000-00000000ec21', '00000000-0000-0000-0000-00000000c0a2', 'stored', 'b/1.mp4', true);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000b001', true);

INSERT INTO public.live_series (id, title, host_id)
VALUES ('00000000-0000-0000-0000-000000005e01', 'Cycle TCC', '00000000-0000-0000-0000-00000000b001');
INSERT INTO public.live_series_items (id, series_id, recording_id, position) VALUES
  ('00000000-0000-0000-0000-000000001101', '00000000-0000-0000-0000-000000005e01', '00000000-0000-0000-0000-00000000ec11', 1),
  ('00000000-0000-0000-0000-000000001102', '00000000-0000-0000-0000-000000005e01', '00000000-0000-0000-0000-00000000ec12', 2);
SELECT pg_temp.expect((SELECT count(*) = 2 FROM public.live_series_items), 'a host files their own recordings');

DO $$ BEGIN
  INSERT INTO public.live_series_items (series_id, recording_id, position)
  VALUES ('00000000-0000-0000-0000-000000005e01', '00000000-0000-0000-0000-00000000ec21', 3);
  RAISE EXCEPTION 'FAILED: a host filed another host''s recording';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: other hosts'' recordings cannot be filed';
END $$;

-- Unpublished: a member sees neither the series nor its recordings.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000b003', true);
SELECT pg_temp.expect((SELECT count(*) = 0 FROM public.live_series), 'an unpublished series is hidden');
SELECT pg_temp.expect((SELECT count(*) = 0 FROM public.live_class_recordings), 'its recordings stay hidden');

-- Publish, then reorder.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000b001', true);
UPDATE public.live_series SET is_published = true WHERE id = '00000000-0000-0000-0000-000000005e01';
SELECT public.reorder_live_series('00000000-0000-0000-0000-000000005e01',
  ARRAY['00000000-0000-0000-0000-000000001102', '00000000-0000-0000-0000-000000001101']::uuid[]);
SELECT pg_temp.expect((SELECT position = 1 FROM public.live_series_items WHERE id = '00000000-0000-0000-0000-000000001102'),
  'the host reorders the series');

-- Published: the Academy member sees both recordings; a visitor without
-- all-access sees the series but not the recordings; the other host cannot reorder.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000b003', true);
SELECT pg_temp.expect((SELECT count(*) = 1 FROM public.live_series), 'a member sees the published series');
SELECT pg_temp.expect((SELECT count(*) = 2 FROM public.live_class_recordings), 'a member can watch its recordings');
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000b004', true);
SELECT pg_temp.expect((SELECT count(*) = 1 FROM public.live_series), 'a visitor sees the series listing');
SELECT pg_temp.expect((SELECT count(*) = 0 FROM public.live_class_recordings), 'but not its recordings without all-access');
-- Logged out: the published series lists with its items, no error.
RESET ROLE;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO anon;
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claim.sub', '', true);
SELECT pg_temp.expect((SELECT count(*) = 2 FROM public.live_series_items), 'logged-out visitors list published items');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000b002', true);
DO $$ BEGIN
  PERFORM public.reorder_live_series('00000000-0000-0000-0000-000000005e01',
    ARRAY['00000000-0000-0000-0000-000000001101']::uuid[]);
  RAISE EXCEPTION 'FAILED: another host reordered the series';
EXCEPTION WHEN raise_exception THEN
  IF SQLERRM LIKE 'FAILED%' THEN RAISE; END IF;
  RAISE NOTICE 'ok: only the series host reorders';
END $$;

ROLLBACK;
