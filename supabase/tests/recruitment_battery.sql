-- Recruitment assessment: the candidate never reads the scoring key (table
-- closed, RPC without key, options shuffled), the vignettes are scored on
-- the server, one completed assessment per year, and only the League reads
-- other candidates' reports.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
CREATE FUNCTION pg_temp.raises(_sql text, _msg text, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE _sql;
  RAISE EXCEPTION 'FAILED: % (no error)', _what;
EXCEPTION WHEN raise_exception THEN
  IF SQLERRM LIKE 'FAILED%' THEN RAISE; END IF;
  IF SQLERRM <> _msg THEN RAISE EXCEPTION 'FAILED: % (got %)', _what, SQLERRM; END IF;
  RAISE NOTICE 'ok: %', _what;
END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text), pg_temp.raises(text, text, text) TO authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-00000000a901', 'candidate@test'),
  ('00000000-0000-0000-0000-00000000a902', 'other@test'),
  ('00000000-0000-0000-0000-00000000a903', 'league@test');
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-00000000a903', 'league') ON CONFLICT DO NOTHING;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a901', true);
SELECT pg_temp.expect((SELECT count(*) = 0 FROM public.recruitment_sjt_items), 'candidates cannot read the vignettes table');
CREATE TEMP TABLE a AS SELECT public.recruitment_assessment_start(ARRAY['sport']) AS id;
GRANT SELECT ON a TO authenticated;
CREATE TEMP TABLE v AS SELECT * FROM public.recruitment_sjt_get((SELECT id FROM a));
GRANT SELECT ON v TO authenticated;
SELECT pg_temp.expect((SELECT count(*) = 10 FROM v), 'six core + four sport vignettes');
SELECT pg_temp.expect(NOT EXISTS (SELECT 1 FROM v WHERE options::text LIKE '%"key"%'),
  'the vignettes come without their key');

-- Answer the best option everywhere (looked up as superuser), then submit.
RESET ROLE;
CREATE TEMP TABLE best AS
  SELECT jsonb_object_agg(i.id, (SELECT k FROM jsonb_each_text(i.key) e(k, p) ORDER BY p::int DESC LIMIT 1)) AS ans
  FROM public.recruitment_sjt_items i WHERE i.niche IN ('core', 'sport');
GRANT SELECT ON best TO authenticated;
SET LOCAL ROLE authenticated;
SELECT public.recruitment_assessment_submit((SELECT id FROM a), '{"ipip_1": 4}'::jsonb, (SELECT ans FROM best));
SELECT pg_temp.expect((SELECT (sjt_scores -> 'core' ->> 'pct')::int = 100 AND (sjt_scores -> 'sport' ->> 'pct')::int = 100
  FROM public.recruitment_assessments), 'the server scores the vignettes per module');
SELECT pg_temp.raises($q$SELECT public.recruitment_assessment_start(ARRAY['neuro'])$q$,
  'already completed this year', 'no retake within the year');

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a902', true);
SELECT pg_temp.expect((SELECT count(*) = 0 FROM public.recruitment_assessments), 'others cannot read the report');
SELECT pg_temp.raises(format('SELECT public.recruitment_assessment_submit(%L, %L, %L)', (SELECT id FROM a), '{}', '{}'),
  'not allowed', 'others cannot submit someone else''s assessment');

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000a903', true);
SELECT pg_temp.expect((SELECT count(*) = 1 FROM public.recruitment_assessments), 'the League reads the report');
SELECT public.recruitment_assessment_note((SELECT id FROM a), 'Profil solide en préparation mentale.');
SELECT pg_temp.expect((SELECT committee_note IS NOT NULL FROM public.recruitment_assessments), 'the committee records its note');

ROLLBACK;
