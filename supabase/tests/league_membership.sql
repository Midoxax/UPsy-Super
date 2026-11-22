-- League membership: nothing is granted on a declaration; only a League
-- account confirms a payment, which numbers the receipt and activates the
-- membership (badge, 3 months without commission on a first membership).
-- U.Psy admins cannot confirm League money. Amounts gate the categories.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-00000000e101', 'member@test'),
  ('00000000-0000-0000-0000-00000000e102', 'league@test'),
  ('00000000-0000-0000-0000-00000000e103', 'upsy-admin@test'),
  ('00000000-0000-0000-0000-00000000e104', 'walkin@test');
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-00000000e102', 'league'),
  ('00000000-0000-0000-0000-00000000e103', 'admin') ON CONFLICT DO NOTHING;

SET LOCAL ROLE authenticated;

-- Seeded categories have no amount yet: not offered.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000e101', true);
SELECT pg_temp.expect((SELECT count(*) = 0 FROM public.league_membership_plans),
  'categories without an amount are not offered');

-- The League sets the amount and opens the category.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000e102', true);
UPDATE public.league_membership_plans SET amount_mad = 600, is_active = true WHERE code = 'praticien';
SELECT pg_temp.expect((SELECT amount_mad = 600 FROM public.league_membership_plans WHERE code = 'praticien'),
  'the League sets the fee');

-- A U.Psy admin cannot touch League money.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000e103', true);
UPDATE public.league_membership_plans SET amount_mad = 1 WHERE code = 'praticien';
SELECT pg_temp.expect((SELECT count(*) = 0 FROM public.league_membership_plans WHERE amount_mad = 1),
  'U.Psy admins cannot change League fees');

-- The member applies and declares a transfer.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000e101', true);
CREATE TEMP TABLE m AS
  SELECT public.league_join((SELECT id FROM public.league_membership_plans WHERE code = 'praticien')) AS id;
GRANT SELECT ON m TO authenticated;
SELECT pg_temp.expect(NOT public.is_league_member('00000000-0000-0000-0000-00000000e101'),
  'applying grants nothing');
DO $$ BEGIN
  PERFORM public.league_submit_payment((SELECT id FROM m), 'transfer', 600, 'VIR 123',
    '00000000-0000-0000-0000-00000000e104/receipt.pdf');
  RAISE EXCEPTION 'FAILED: a proof in someone else''s folder was accepted';
EXCEPTION WHEN raise_exception THEN
  IF SQLERRM <> 'proof required' THEN RAISE; END IF;
  RAISE NOTICE 'ok: the proof must be the member''s own upload';
END $$;
CREATE TEMP TABLE pay AS
  SELECT public.league_submit_payment((SELECT id FROM m), 'transfer', 600, 'VIR 123',
    '00000000-0000-0000-0000-00000000e101/receipt.pdf') AS id;
GRANT SELECT ON pay TO authenticated;
DO $$ BEGIN
  PERFORM public.league_review_payment((SELECT id FROM pay), true, NULL);
  RAISE EXCEPTION 'FAILED: a member confirmed their own payment';
EXCEPTION WHEN raise_exception THEN
  IF SQLERRM <> 'forbidden' THEN RAISE; END IF;
  RAISE NOTICE 'ok: members cannot confirm payments';
END $$;

-- A U.Psy admin cannot confirm either.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000e103', true);
DO $$ BEGIN
  PERFORM public.league_review_payment((SELECT id FROM pay), true, NULL);
  RAISE EXCEPTION 'FAILED: a U.Psy admin confirmed a League payment';
EXCEPTION WHEN raise_exception THEN
  IF SQLERRM <> 'forbidden' THEN RAISE; END IF;
  RAISE NOTICE 'ok: U.Psy admins cannot confirm League payments';
END $$;

-- The League confirms: receipt numbered, membership active for 12 months,
-- first membership gives 3 months without commission.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000e102', true);
SELECT public.league_review_payment((SELECT id FROM pay), true, 'Reçu sur le compte');
SELECT pg_temp.expect((SELECT receipt_number LIKE 'REC-COT-' || extract(year FROM now()) || '-00001'
  FROM public.league_payments WHERE id = (SELECT id FROM pay)), 'the receipt gets the first number of the year');
SELECT pg_temp.expect((SELECT status = 'active' AND member_number LIKE 'LSSPM-%'
    AND ends_on = (current_date + interval '12 months')::date - 1
    AND commission_free_until = (current_date + interval '3 months')::date
  FROM public.league_memberships WHERE id = (SELECT id FROM m)), 'the membership is confirmed with its benefits');
SELECT pg_temp.expect(public.is_league_member('00000000-0000-0000-0000-00000000e101'), 'the psychologist is a member');

-- A walk-in pays cash at an event: recorded and confirmed by the League.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000e104', true);
CREATE TEMP TABLE m2 AS
  SELECT public.league_join((SELECT id FROM public.league_membership_plans WHERE code = 'praticien')) AS id;
GRANT SELECT ON m2 TO authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000e102', true);
SELECT public.league_record_payment((SELECT id FROM m2), 'cash', 600, 'Congrès');
SELECT pg_temp.expect((SELECT array_agg(receipt_number ORDER BY receipt_number) =
    ARRAY['REC-COT-' || extract(year FROM now()) || '-00001', 'REC-COT-' || extract(year FROM now()) || '-00002']
  FROM public.league_payments), 'cash is numbered next, with no gap');

-- The member sees only their own records; the League sees the desk.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000e101', true);
SELECT pg_temp.expect((SELECT count(*) = 1 FROM public.league_payments), 'members see only their own payments');
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000e102', true);
SELECT pg_temp.expect((SELECT count(*) = 2 FROM public.league_membership_desk()), 'the League sees every membership');

ROLLBACK;
