-- Course copy is editable by admins only (RLS "Admins can manage courses"); the
-- admin Translations tab relies on it.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-0000000007ad', 'courses-admin@test'),
  ('00000000-0000-0000-0000-0000000007b1', 'courses-member@test');
INSERT INTO public.user_roles (user_id, role)
  VALUES ('00000000-0000-0000-0000-0000000007ad', 'admin') ON CONFLICT DO NOTHING;
INSERT INTO public.courses (slug, title)
  VALUES ('copy-test', 'Copy test')
  ON CONFLICT (slug) DO NOTHING;

SET LOCAL ROLE authenticated;

-- A member's update matches no row under RLS.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000007b1', true);
UPDATE public.courses SET description_fr = 'piraté' WHERE slug = 'copy-test';
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000007ad', true);
SELECT pg_temp.expect(
  (SELECT description_fr IS DISTINCT FROM 'piraté' FROM public.courses WHERE slug = 'copy-test'),
  'a non-admin cannot change course copy');

-- An admin can edit the copy in every language.
UPDATE public.courses
  SET description_fr = 'Le niveau le plus complet', title_ar = 'نخبة'
  WHERE slug = 'copy-test';
SELECT pg_temp.expect(
  (SELECT description_fr = 'Le niveau le plus complet' AND title_ar = 'نخبة'
     FROM public.courses WHERE slug = 'copy-test'),
  'an admin can edit course titles and descriptions');

RESET ROLE;
ROLLBACK;
