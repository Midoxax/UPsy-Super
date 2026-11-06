-- Plan copy is editable by admins only (RLS "admins manage plans"); the
-- admin Translations tab relies on it.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-0000000005ad', 'plans-admin@test'),
  ('00000000-0000-0000-0000-0000000005b1', 'plans-member@test');
INSERT INTO public.user_roles (user_id, role)
  VALUES ('00000000-0000-0000-0000-0000000005ad', 'admin') ON CONFLICT DO NOTHING;
INSERT INTO public.membership_plans (tier, name, tagline, price_monthly_mad)
  VALUES ('elite', 'Elite', 'x', 100)
  ON CONFLICT (tier) DO UPDATE SET price_monthly_mad = 100;

SET LOCAL ROLE authenticated;

-- A member's update matches no row under RLS.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000005b1', true);
UPDATE public.membership_plans SET tagline_fr = 'piraté' WHERE tier = 'elite';
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000005ad', true);
SELECT pg_temp.expect(
  (SELECT tagline_fr IS DISTINCT FROM 'piraté' FROM public.membership_plans WHERE tier = 'elite'),
  'a non-admin cannot change plan copy');

-- An admin can edit the copy in every language.
UPDATE public.membership_plans
  SET tagline_fr = 'Le niveau le plus complet', name_ar = 'نخبة'
  WHERE tier = 'elite';
SELECT pg_temp.expect(
  (SELECT tagline_fr = 'Le niveau le plus complet' AND name_ar = 'نخبة'
     FROM public.membership_plans WHERE tier = 'elite'),
  'an admin can edit plan names and taglines');

RESET ROLE;
ROLLBACK;
