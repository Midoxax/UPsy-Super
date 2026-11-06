-- AI consent: users set and withdraw their own; only the service role can
-- check anyone's; each change is audited; restricting processing voids it.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated;
CREATE FUNCTION pg_temp.as_user(_id uuid) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', _id::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub', _id, 'aal', 'aal1')::text, true);
  EXECUTE 'SET LOCAL ROLE authenticated';
END $$;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-0000000a1c01', 'ai-a@test'),
  ('00000000-0000-0000-0000-0000000a1c02', 'ai-b@test');

SELECT pg_temp.expect(NOT public.has_ai_consent('00000000-0000-0000-0000-0000000a1c01'),
  'no consent by default');

-- The user grants consent on their own row.
SELECT pg_temp.as_user('00000000-0000-0000-0000-0000000a1c01');
INSERT INTO public.privacy_preferences (user_id, ai_consent_at, ai_consent_version)
  VALUES ('00000000-0000-0000-0000-0000000a1c01', now(), '2026-11');
DO $$ BEGIN
  PERFORM public.has_ai_consent('00000000-0000-0000-0000-0000000a1c02');
  RAISE EXCEPTION 'FAILED: authenticated user could call has_ai_consent';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: users cannot probe consent';
END $$;
DO $$ BEGIN
  INSERT INTO public.privacy_preferences (user_id, ai_consent_at)
    VALUES ('00000000-0000-0000-0000-0000000a1c02', now());
  RAISE EXCEPTION 'FAILED: user consented for someone else';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: cannot consent for another user';
END $$;
RESET ROLE;

SELECT pg_temp.expect(public.has_ai_consent('00000000-0000-0000-0000-0000000a1c01'),
  'consent recorded');
SELECT pg_temp.expect((SELECT count(*) FROM public.audit_log
  WHERE action = 'ai_consent_given' AND user_id = '00000000-0000-0000-0000-0000000a1c01') = 1,
  'grant audited');

-- Restricting processing voids it.
UPDATE public.privacy_preferences SET processing_restricted = true
  WHERE user_id = '00000000-0000-0000-0000-0000000a1c01';
SELECT pg_temp.expect(NOT public.has_ai_consent('00000000-0000-0000-0000-0000000a1c01'),
  'restricted processing voids consent');
UPDATE public.privacy_preferences SET processing_restricted = false
  WHERE user_id = '00000000-0000-0000-0000-0000000a1c01';

-- Withdrawal.
SELECT pg_temp.as_user('00000000-0000-0000-0000-0000000a1c01');
UPDATE public.privacy_preferences SET ai_consent_at = NULL
  WHERE user_id = '00000000-0000-0000-0000-0000000a1c01';
RESET ROLE;
SELECT pg_temp.expect(NOT public.has_ai_consent('00000000-0000-0000-0000-0000000a1c01'),
  'withdrawal takes effect');
SELECT pg_temp.expect((SELECT count(*) FROM public.audit_log
  WHERE action = 'ai_consent_withdrawn' AND user_id = '00000000-0000-0000-0000-0000000a1c01') = 1,
  'withdrawal audited');

ROLLBACK;
