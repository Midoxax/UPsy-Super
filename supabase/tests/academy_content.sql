-- Academy content: the two new courses exist with five bilingual modules each,
-- and module order stays unique per course (re-running adds no duplicates).
\set ON_ERROR_STOP 1
BEGIN;
CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;

SELECT pg_temp.expect((SELECT count(*) FROM public.courses
  WHERE slug IN ('tcc-les-fondamentaux', 'therapie-des-schemas-introduction') AND is_published) = 2,
  'CBT and schema therapy courses are published');
SELECT pg_temp.expect((SELECT count(*) FROM public.course_modules m JOIN public.courses c ON c.id = m.course_id
  WHERE c.slug IN ('tcc-les-fondamentaux', 'therapie-des-schemas-introduction')
    AND length(m.content) > 400 AND length(m.content_fr) > 400 AND m.title_ar IS NOT NULL) = 10,
  'ten modules written in English and French with Arabic titles');
SELECT pg_temp.expect(NOT EXISTS (
  SELECT 1 FROM public.course_modules GROUP BY course_id, order_index HAVING count(*) > 1),
  'no duplicate module positions');
ROLLBACK;
