-- Notification emails: each step of membership, payments, passport reviews and
-- orders writes a notification marked for email, to the right person; staff
-- alerts reach League reviewers (not admins) or admins; buyers cancelling
-- their own order are not notified.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
CREATE FUNCTION pg_temp.n(_user text, _type text) RETURNS bigint LANGUAGE sql AS $$
  SELECT count(*) FROM public.notifications
  WHERE user_id = _user::uuid AND type = _type AND email_status = 'pending' $$;
-- Whether any notification matches; reads past RLS like the sender does.
CREATE FUNCTION pg_temp.ex(_where text) RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE r boolean;
BEGIN EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.notifications WHERE ' || _where || ')' INTO r; RETURN r; END $$;
ALTER FUNCTION pg_temp.n(text, text) SECURITY DEFINER;
ALTER FUNCTION pg_temp.ex(text) SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text), pg_temp.n(text, text), pg_temp.ex(text) TO authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-00000000c901', 'admin@test'),
  ('00000000-0000-0000-0000-00000000c902', 'league@test'),
  ('00000000-0000-0000-0000-00000000c903', 'member@test');
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-00000000c901', 'admin'),
  ('00000000-0000-0000-0000-00000000c902', 'league') ON CONFLICT DO NOTHING;
UPDATE public.league_membership_plans SET is_active = true, amount_mad = 500;
INSERT INTO public.publications (id, slug, title, is_published, price_ebook)
  VALUES ('00000000-0000-0000-0000-00000000c9a1', 'livret-notif', 'Livret', true, 100);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000c903', true);
CREATE TEMP TABLE m AS SELECT public.league_join((SELECT id FROM public.league_membership_plans LIMIT 1)) AS id;
GRANT SELECT ON m TO authenticated;
SELECT public.league_submit_payment((SELECT id FROM m), 'transfer', 500, 'VIR', '00000000-0000-0000-0000-00000000c903/r.pdf');
SELECT pg_temp.expect(pg_temp.n('00000000-0000-0000-0000-00000000c902', 'league_staff') = 1,
  'League reviewers are alerted to a receipt');
SELECT pg_temp.expect(pg_temp.n('00000000-0000-0000-0000-00000000c901', 'league_staff') = 0,
  'U.Psy admins are not alerted to League money');

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000c902', true);
SELECT public.league_review_payment((SELECT id FROM public.league_payments LIMIT 1), false, 'Montant incomplet');
SELECT pg_temp.expect(pg_temp.n('00000000-0000-0000-0000-00000000c903', 'league') = 1
  AND pg_temp.ex($w$body LIKE '%Montant incomplet%'$w$),
  'a refused payment notifies the member with the reason');
SELECT public.league_record_payment((SELECT id FROM m), 'cash', 500, NULL);
SELECT pg_temp.expect(pg_temp.n('00000000-0000-0000-0000-00000000c903', 'league') = 2
  AND pg_temp.ex($w$title LIKE '%adhésion%confirmée%' AND body LIKE '%LSSPM-%'$w$),
  'confirming the membership notifies the member with the number');

-- Orders.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000c903', true);
CREATE TEMP TABLE o AS SELECT public.publication_order('00000000-0000-0000-0000-00000000c9a1', 'ebook', 1, NULL, NULL, NULL, NULL) AS id;
GRANT SELECT ON o TO authenticated;
SELECT pg_temp.expect(pg_temp.n('00000000-0000-0000-0000-00000000c903', 'shop') = 1, 'an order is acknowledged');
SELECT public.publication_order_pay((SELECT id FROM o), 'transfer', NULL, '00000000-0000-0000-0000-00000000c903/p.pdf');
SELECT pg_temp.expect(pg_temp.n('00000000-0000-0000-0000-00000000c901', 'shop_admin') = 1
  AND pg_temp.n('00000000-0000-0000-0000-00000000c902', 'shop_admin') = 0, 'admins, not the League, check shop receipts');
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000c901', true);
SELECT public.publication_order_admin((SELECT id FROM o), 'confirm', NULL, NULL);
SELECT pg_temp.expect(pg_temp.ex($w$type = 'shop'
  AND title LIKE 'Paiement confirmé%' AND body LIKE '%FAC-UPSY-%' AND body LIKE '%ebook%'$w$),
  'a confirmed payment sends the invoice number and the ebook notice');
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000c903', true);
CREATE TEMP TABLE o2 AS SELECT public.publication_order('00000000-0000-0000-0000-00000000c9a1', 'ebook', 1, NULL, NULL, NULL, NULL) AS id;
GRANT SELECT ON o2 TO authenticated;
SELECT public.publication_order_cancel((SELECT id FROM o2));
SELECT pg_temp.expect(NOT pg_temp.ex($w$title LIKE 'Commande annulée%'$w$),
  'a buyer cancelling their own order is not notified');

-- Passport.
RESET ROLE;
INSERT INTO public.passport_entries (id, user_id, kind, title, status)
  VALUES ('00000000-0000-0000-0000-00000000c9b1', '00000000-0000-0000-0000-00000000c903', 'degree', 'Master', 'submitted');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000c902', true);
SELECT public.passport_review('00000000-0000-0000-0000-00000000c9b1', true, NULL);
SELECT pg_temp.expect(pg_temp.n('00000000-0000-0000-0000-00000000c903', 'passport') = 1
  AND pg_temp.ex($w$type = 'passport' AND body LIKE '%Master%validé%'$w$),
  'a validated passport item notifies its owner');

ROLLBACK;
