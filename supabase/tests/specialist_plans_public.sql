-- Behaviour test for 20261104180000_specialist_plans_public_readable.sql.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO anon, authenticated;

INSERT INTO public.specialist_plans (id, name, is_active) VALUES
  ('test_active', 'Active test plan', true),
  ('test_hidden', 'Hidden test plan', false)
ON CONFLICT (id) DO UPDATE SET is_active = EXCLUDED.is_active;

SET LOCAL ROLE anon;
SELECT pg_temp.expect(EXISTS (SELECT 1 FROM public.specialist_plans_public WHERE id = 'test_active'),
  'anon sees active plans through the view');
SELECT pg_temp.expect(NOT EXISTS (SELECT 1 FROM public.specialist_plans_public WHERE id = 'test_hidden'),
  'anon does not see inactive plans');
SELECT pg_temp.expect(NOT EXISTS (SELECT 1 FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'specialist_plans_public' AND column_name = 'commission_rate'),
  'view does not expose commission_rate');
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000004b1', true);
SELECT pg_temp.expect(EXISTS (SELECT 1 FROM public.specialist_plans_public WHERE id = 'test_active'),
  'signed-in non-specialist sees active plans');
RESET ROLE;
ROLLBACK;
