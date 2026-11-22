-- Passport: the owner cannot validate their own items; only the League
-- validates what was submitted; editing a validated item sends it back; a
-- share link shows only validated, shareable items and stops working when
-- revoked; the League never sees drafts.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated, anon;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-00000000f101', 'psy@test'),
  ('00000000-0000-0000-0000-00000000f102', 'league@test');
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-00000000f102', 'league') ON CONFLICT DO NOTHING;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000f101', true);

-- A degree, submitted; a draft conference; an aspiration.
INSERT INTO public.passport_entries (id, kind, title, organization, status, validated_by, proof_path) VALUES
  ('00000000-0000-0000-0000-00000000fe01', 'degree', 'Master psychologie clinique', 'Université Hassan II',
   'validated', '00000000-0000-0000-0000-00000000f101', '00000000-0000-0000-0000-00000000f101/master.pdf');
INSERT INTO public.passport_entries (id, kind, title) VALUES
  ('00000000-0000-0000-0000-00000000fe02', 'conference', 'Congrès national de psychologie'),
  ('00000000-0000-0000-0000-00000000fe03', 'aspiration', 'Développer la psychologie du sport au Maroc');

SELECT pg_temp.expect((SELECT status = 'draft' AND validated_by IS NULL FROM public.passport_entries
  WHERE id = '00000000-0000-0000-0000-00000000fe01'), 'an owner cannot create a validated item');
SELECT pg_temp.expect((SELECT status = 'declared' FROM public.passport_entries
  WHERE id = '00000000-0000-0000-0000-00000000fe03'), 'aspirations are declared, not validated');

UPDATE public.passport_entries SET status = 'submitted' WHERE id = '00000000-0000-0000-0000-00000000fe01';
UPDATE public.passport_entries SET status = 'validated' WHERE id = '00000000-0000-0000-0000-00000000fe01';
SELECT pg_temp.expect((SELECT status = 'submitted' FROM public.passport_entries
  WHERE id = '00000000-0000-0000-0000-00000000fe01'), 'an owner cannot validate their own item');

-- The League sees the submitted degree, not the draft.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000f102', true);
SELECT pg_temp.expect((SELECT count(*) = 1 FROM public.passport_review_queue()), 'the League sees only submitted items');
SELECT pg_temp.expect((SELECT count(*) = 1 FROM public.passport_entries), 'the League never reads drafts');
SELECT public.passport_review('00000000-0000-0000-0000-00000000fe01', true, NULL);

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000f101', true);
SELECT pg_temp.expect((SELECT status = 'validated' AND validated_by = '00000000-0000-0000-0000-00000000f102'
  FROM public.passport_entries WHERE id = '00000000-0000-0000-0000-00000000fe01'), 'the League validates an item');

-- Share link: shows the validated degree and the aspiration, not the draft.
CREATE TEMP TABLE share AS
  WITH ins AS (INSERT INTO public.passport_shares (label) VALUES ('Recrutement') RETURNING token)
  SELECT token FROM ins;
GRANT SELECT ON share TO anon, authenticated;
RESET ROLE;
SET LOCAL ROLE anon;
SELECT pg_temp.expect((SELECT jsonb_array_length(public.passport_public((SELECT token FROM share))->'entries') = 2),
  'a share link shows validated and declared items only');

-- Editing the validated degree sends it back to draft: it leaves the link.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000f101', true);
UPDATE public.passport_entries SET title = 'Master en psychologie clinique et santé'
  WHERE id = '00000000-0000-0000-0000-00000000fe01';
SELECT pg_temp.expect((SELECT status = 'draft' AND validated_at IS NULL FROM public.passport_entries
  WHERE id = '00000000-0000-0000-0000-00000000fe01'), 'editing a validated item needs a new validation');

-- Revoked: the link returns nothing.
UPDATE public.passport_shares SET revoked_at = now();
RESET ROLE;
SET LOCAL ROLE anon;
SELECT pg_temp.expect(public.passport_public((SELECT token FROM share)) IS NULL, 'a revoked link shows nothing');
SELECT pg_temp.expect(public.passport_public('not-a-token') IS NULL, 'an unknown link shows nothing');

ROLLBACK;
