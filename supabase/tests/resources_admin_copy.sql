-- Resource copy is editable by admins only (RLS "Admins manage resources"); the
-- admin Translations tab relies on it.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-0000000008ad', 'resources-admin@test'),
  ('00000000-0000-0000-0000-0000000008b1', 'resources-member@test');
INSERT INTO public.user_roles (user_id, role)
  VALUES ('00000000-0000-0000-0000-0000000008ad', 'admin') ON CONFLICT DO NOTHING;
INSERT INTO public.resources (slug, title, format)
  VALUES ('copy-test', 'Copy test', 'article')
  ON CONFLICT (slug) DO NOTHING;

SET LOCAL ROLE authenticated;

-- A member's update matches no row under RLS.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000008b1', true);
UPDATE public.resources SET summary_fr = 'piraté' WHERE slug = 'copy-test';
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000008ad', true);
SELECT pg_temp.expect(
  (SELECT summary_fr IS DISTINCT FROM 'piraté' FROM public.resources WHERE slug = 'copy-test'),
  'a non-admin cannot change resource copy');

-- An admin can edit the copy in every language.
UPDATE public.resources
  SET summary_fr = 'Le niveau le plus complet', title_ar = 'نخبة'
  WHERE slug = 'copy-test';
SELECT pg_temp.expect(
  (SELECT summary_fr = 'Le niveau le plus complet' AND title_ar = 'نخبة'
     FROM public.resources WHERE slug = 'copy-test'),
  'an admin can edit resource titles and summaries');

RESET ROLE;
ROLLBACK;
