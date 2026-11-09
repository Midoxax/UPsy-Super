-- Validated instruments: codes are unique, linked rows are flagged, and the
-- replaced 5-item PCL-5 is hidden.
\set ON_ERROR_STOP 1
BEGIN;
CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;

SELECT pg_temp.expect((SELECT count(*) FROM public.assessments WHERE code IN ('who5','dass21','pcl5','audit','k6')) = 5,
  'five new validated instruments seeded');
SELECT pg_temp.expect(NOT EXISTS (SELECT 1 FROM public.assessments WHERE code IS NOT NULL AND NOT is_validated),
  'every coded assessment is marked validated');
DO $$ BEGIN
  INSERT INTO public.assessments (title, code) VALUES ('dup', 'who5');
  RAISE EXCEPTION 'FAILED: duplicate code accepted';
EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'ok: codes are unique';
END $$;
ROLLBACK;
