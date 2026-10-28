-- Behaviour test for 20261028092000_crm_content_attribution.sql.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;

INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('00000000-0000-0000-0000-00000000f101', 'reader@crm.test',
   '{"full_name":"Reader","first_touch":{"utm_source":"linkedin","utm_medium":"social","utm_campaign":"al-haouz"}}'),
  ('00000000-0000-0000-0000-00000000f102', 'boss@crm.test', '{}');
INSERT INTO public.profiles (id, full_name)
  VALUES ('00000000-0000-0000-0000-00000000f101', 'Reader')
  ON CONFLICT (id) DO NOTHING;
-- Profiles may come from a signup trigger instead; make sure the link ran.
SELECT pg_temp.expect(
  (SELECT first_touch ->> 'utm_campaign' FROM public.crm_contacts WHERE email = 'reader@crm.test') = 'al-haouz',
  'a signup carries its first touch into the CRM');

INSERT INTO public.user_roles (user_id, role) VALUES ('00000000-0000-0000-0000-00000000f102', 'admin');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000f102","role":"authenticated"}', true);
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000f102', true);
SELECT pg_temp.expect(
  (SELECT accounts FROM public.crm_content_attribution(30) WHERE campaign = 'al-haouz' AND source = 'linkedin') = 1,
  'the report credits the post that brought the account');

SELECT set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000f101","role":"authenticated"}', true);
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000f101', true);
DO $$ BEGIN
  PERFORM * FROM public.crm_content_attribution(30);
  RAISE EXCEPTION 'FAILED: non-admin read the report';
EXCEPTION WHEN raise_exception THEN
  IF SQLERRM LIKE 'FAILED%' THEN RAISE; END IF;
  RAISE NOTICE 'ok: report is admin-only';
END $$;

ROLLBACK;
