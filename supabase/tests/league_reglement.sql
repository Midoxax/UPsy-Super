-- Membership per the règlement intérieur: student rates only under 30 and
-- with an enrolment certificate, a photo for the card, dues for the calendar
-- year, honorary seats granted by the League without payment, and a public
-- QR check that tells a valid card from an expired one.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
CREATE FUNCTION pg_temp.raises(_sql text, _msg text, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE _sql;
  RAISE EXCEPTION 'FAILED: % (no error)', _what;
EXCEPTION WHEN raise_exception THEN
  IF SQLERRM LIKE 'FAILED%' THEN RAISE; END IF;
  IF SQLERRM <> _msg THEN RAISE EXCEPTION 'FAILED: % (got %)', _what, SQLERRM; END IF;
  RAISE NOTICE 'ok: %', _what;
END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text), pg_temp.raises(text, text, text) TO anon, authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-00000000d201', 'student@test'),
  ('00000000-0000-0000-0000-00000000d202', 'league@test'),
  ('00000000-0000-0000-0000-00000000d203', 'expert@test');
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-00000000d202', 'league') ON CONFLICT DO NOTHING;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000d201', true);
SELECT pg_temp.expect((SELECT amount_mad = 900 FROM public.league_membership_plans WHERE code = 'praticien')
  AND (SELECT amount_mad = 700 FROM public.league_membership_plans WHERE code = 'doctorant')
  AND (SELECT amount_mad = 500 FROM public.league_membership_plans WHERE code = 'master')
  AND (SELECT amount_mad = 300 FROM public.league_membership_plans WHERE code = 'sympathisant'),
  'the fees are those of Art. 8');
SELECT pg_temp.raises($q$SELECT public.league_join((SELECT id FROM public.league_membership_plans WHERE code = 'master'))$q$,
  'photo required', 'a photo is required for the card');
SELECT pg_temp.raises($q$SELECT public.league_join((SELECT id FROM public.league_membership_plans WHERE code = 'master'),
  (current_date - interval '31 years')::date, '00000000-0000-0000-0000-00000000d201/p.jpg',
  '00000000-0000-0000-0000-00000000d201/e.pdf')$q$,
  'age limit', 'a student aged 30 or more cannot take the student rate');
SELECT pg_temp.raises($q$SELECT public.league_join((SELECT id FROM public.league_membership_plans WHERE code = 'master'),
  (current_date - interval '24 years')::date, '00000000-0000-0000-0000-00000000d201/p.jpg')$q$,
  'enrolment certificate required', 'a student rate needs the enrolment certificate');
SELECT pg_temp.raises($q$SELECT public.league_join((SELECT id FROM public.league_membership_plans WHERE code = 'honoraire'),
  _photo_path => '00000000-0000-0000-0000-00000000d201/p.jpg')$q$,
  'plan unavailable', 'honorary membership cannot be self-granted');
CREATE TEMP TABLE m AS SELECT public.league_join((SELECT id FROM public.league_membership_plans WHERE code = 'master'),
  (current_date - interval '24 years')::date, '00000000-0000-0000-0000-00000000d201/p.jpg',
  '00000000-0000-0000-0000-00000000d201/e.pdf') AS id;
GRANT SELECT ON m TO authenticated, anon;

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000d202', true);
SELECT public.league_record_payment((SELECT id FROM m), 'cash', 500, NULL);
SELECT pg_temp.expect((SELECT status = 'active'
    AND ends_on = make_date(extract(year FROM current_date)::int
                            + (extract(month FROM current_date) >= 10)::int, 12, 31)
    AND attestation_number LIKE 'ATT-%' AND length(verify_token) >= 32
  FROM public.league_memberships WHERE id = (SELECT id FROM m)),
  'confirmed to 31 December (of next year from October) with an attestation number and a QR token');
SELECT pg_temp.expect((SELECT category = 'supporter' FROM public.league_membership_desk()
  WHERE membership_id = (SELECT id FROM m)), 'a master''s student gets the supporter card');

-- Honorary: granted by the League, active at once, no payment.
SELECT public.league_grant('Expert@Test', 'honoraire');
SELECT pg_temp.expect(public.is_league_member('00000000-0000-0000-0000-00000000d203')
  AND NOT EXISTS (SELECT 1 FROM public.league_payments WHERE user_id = '00000000-0000-0000-0000-00000000d203'),
  'an honorary member is active without payment');

-- The QR check: valid now, invalid once expired; an unknown token says nothing.
RESET ROLE;
CREATE TEMP TABLE tok AS SELECT verify_token AS t FROM public.league_memberships WHERE id = (SELECT id FROM m);
GRANT SELECT ON tok TO anon;
SET LOCAL ROLE anon;
SELECT pg_temp.expect((public.league_verify((SELECT t FROM tok)) ->> 'valid')::boolean,
  'visitors can verify a valid card');
SELECT pg_temp.expect(public.league_verify(repeat('0', 64)) IS NULL, 'an unknown token reveals nothing');
RESET ROLE;
UPDATE public.league_memberships SET ends_on = current_date - 1 WHERE id = (SELECT id FROM m);
SET LOCAL ROLE anon;
SELECT pg_temp.expect(NOT (public.league_verify((SELECT t FROM tok)) ->> 'valid')::boolean,
  'an expired card shows as not valid');

-- From 1 October a membership runs through the following year; before, to
-- the end of the current one. The start date follows a previous membership.
RESET ROLE;
CREATE FUNCTION pg_temp.ends_after(_prev_end date) RETURNS date LANGUAGE plpgsql AS $$
DECLARE _id uuid; _plan uuid := (SELECT id FROM public.league_membership_plans WHERE code = 'praticien');
BEGIN
  DELETE FROM public.league_memberships WHERE user_id = '00000000-0000-0000-0000-00000000d203';
  INSERT INTO public.league_memberships (user_id, plan_id, status, member_number, starts_on, ends_on, verify_token)
  VALUES ('00000000-0000-0000-0000-00000000d203', _plan, 'active', 'LSSPM-T-9', _prev_end - 30, _prev_end,
          repeat('ab', 32));
  INSERT INTO public.league_memberships (user_id, plan_id)
  VALUES ('00000000-0000-0000-0000-00000000d203', _plan) RETURNING id INTO _id;
  PERFORM public.league_activate(_id, NULL);
  RETURN (SELECT ends_on FROM public.league_memberships WHERE id = _id);
END $$;
SELECT pg_temp.expect(pg_temp.ends_after('2030-09-29') = '2030-12-31', 'approved on 30 September: to 31 December');
SELECT pg_temp.expect(pg_temp.ends_after('2030-09-30') = '2031-12-31', 'approved on 1 October: to the end of next year');
SELECT pg_temp.expect(pg_temp.ends_after('2030-12-31') = '2031-12-31', 'a renewal covers the next calendar year');
SELECT pg_temp.expect((SELECT count(DISTINCT member_number) = 1 AND count(*) = 2 FROM public.league_memberships
  WHERE user_id = '00000000-0000-0000-0000-00000000d203'), 'a renewal keeps the member number');
-- A second renewal: the QR code stays the same and sits on the newest membership only.
INSERT INTO public.league_memberships (user_id, plan_id)
  SELECT '00000000-0000-0000-0000-00000000d203', id FROM public.league_membership_plans WHERE code = 'praticien';
SELECT public.league_activate((SELECT id FROM public.league_memberships
  WHERE user_id = '00000000-0000-0000-0000-00000000d203' AND status = 'pending'), NULL);
SELECT pg_temp.expect((SELECT array_agg(verify_token ORDER BY ends_on) = ARRAY[NULL, NULL, repeat('ab', 32)]
    AND max(ends_on) = '2032-12-31'
  FROM public.league_memberships WHERE user_id = '00000000-0000-0000-0000-00000000d203'),
  'renewals keep the same QR code, carried by the newest membership');
SELECT pg_temp.expect(
  EXISTS (SELECT 1 FROM public.notifications WHERE user_id = '00000000-0000-0000-0000-00000000d203'
          AND title = 'Votre adhésion à la LSSPM est confirmée')
  AND EXISTS (SELECT 1 FROM public.notifications WHERE user_id = '00000000-0000-0000-0000-00000000d203'
              AND title = 'Votre adhésion à la LSSPM est renouvelée' AND body LIKE '%2032%'),
  'a first membership is welcomed, a renewal is thanked');
SELECT pg_temp.raises($q$UPDATE public.league_memberships SET member_number = 'LSSPM-T-9'
  WHERE user_id <> '00000000-0000-0000-0000-00000000d203' AND member_number IS NOT NULL$q$,
  'member number LSSPM-T-9 belongs to another member', 'a member number cannot be given to someone else');

ROLLBACK;
