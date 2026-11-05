-- Community space copy is editable by admins only (RLS "admins manage spaces"); the
-- admin Translations tab relies on it.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-0000000006ad', 'spaces-admin@test'),
  ('00000000-0000-0000-0000-0000000006b1', 'spaces-member@test');
INSERT INTO public.user_roles (user_id, role)
  VALUES ('00000000-0000-0000-0000-0000000006ad', 'admin') ON CONFLICT DO NOTHING;
INSERT INTO public.community_spaces (slug, name, type, tier_required)
  VALUES ('copy-test', 'Copy test', 'topic', 'discover')
  ON CONFLICT (slug) DO NOTHING;

SET LOCAL ROLE authenticated;

-- A member's update matches no row under RLS.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000006b1', true);
UPDATE public.community_spaces SET description_fr = 'piraté' WHERE slug = 'copy-test';
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000006ad', true);
SELECT pg_temp.expect(
  (SELECT description_fr IS DISTINCT FROM 'piraté' FROM public.community_spaces WHERE slug = 'copy-test'),
  'a non-admin cannot change space copy');

-- An admin can edit the copy in every language.
UPDATE public.community_spaces
  SET description_fr = 'Le niveau le plus complet', name_ar = 'نخبة'
  WHERE slug = 'copy-test';
SELECT pg_temp.expect(
  (SELECT description_fr = 'Le niveau le plus complet' AND name_ar = 'نخبة'
     FROM public.community_spaces WHERE slug = 'copy-test'),
  'an admin can edit space names and descriptions');

RESET ROLE;
ROLLBACK;
