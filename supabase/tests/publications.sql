-- Publications: the server sets the price (member price only for a confirmed
-- League member), a printed order needs an address and pays shipping, only
-- admins confirm payment (with a gapless invoice number), and only the buyer
-- of a paid ebook may download it.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
CREATE FUNCTION pg_temp.raises(_sql text, _msg text, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE _sql;
  RAISE EXCEPTION 'FAILED: % (no error)', _what;
EXCEPTION WHEN raise_exception OR check_violation THEN
  IF SQLERRM LIKE 'FAILED%' THEN RAISE; END IF;
  IF _msg IS NOT NULL AND SQLERRM <> _msg THEN RAISE EXCEPTION 'FAILED: % (got %)', _what, SQLERRM; END IF;
  RAISE NOTICE 'ok: %', _what;
END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text), pg_temp.raises(text, text, text) TO anon, authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-00000000b801', 'admin@test'),
  ('00000000-0000-0000-0000-00000000b802', 'member@test'),
  ('00000000-0000-0000-0000-00000000b803', 'public@test');
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-00000000b801', 'admin') ON CONFLICT DO NOTHING;
INSERT INTO public.league_memberships (user_id, plan_id, status, starts_on, ends_on)
  SELECT '00000000-0000-0000-0000-00000000b802', id, 'active', current_date, current_date + 365
  FROM public.league_membership_plans LIMIT 1;
UPDATE public.shop_settings SET shipping_fee_mad = 40;

SELECT pg_temp.raises($q$INSERT INTO public.publications (slug, title, price_ebook, price_ebook_member)
  VALUES ('bad', 'Bad', 100, 150)$q$, NULL, 'a member price above the public price is refused');

INSERT INTO public.publications (id, slug, title, is_published, ebook_path,
  price_print, price_print_member, price_ebook, price_ebook_member) VALUES
  ('00000000-0000-0000-0000-00000000b8a1', 'livret-test', 'Livret', true, 'livret-test/livret.pdf', 300, 250, 120, 80),
  ('00000000-0000-0000-0000-00000000b8a2', 'brouillon', 'Brouillon', false, NULL, 200, NULL, NULL, NULL);

SET LOCAL ROLE anon;
SELECT pg_temp.expect((SELECT count(*) = 1 FROM public.publications), 'visitors see only published titles');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000b803', true);
CREATE TEMP TABLE o AS SELECT
  public.publication_order('00000000-0000-0000-0000-00000000b8a1', 'ebook', 5, NULL, NULL, NULL, NULL) AS pub_ebook,
  public.publication_order('00000000-0000-0000-0000-00000000b8a1', 'print', 2, 'Nom', 'Rue 1', 'Rabat', '0600') AS pub_print;
GRANT SELECT ON o TO authenticated;
SELECT pg_temp.expect((SELECT unit_price_mad = 120 AND quantity = 1 AND NOT member_price AND total_mad = 120
  FROM public.publication_orders WHERE id = (SELECT pub_ebook FROM o)), 'a non-member pays the public ebook price, one copy');
SELECT pg_temp.expect((SELECT total_mad = 640 FROM public.publication_orders WHERE id = (SELECT pub_print FROM o)),
  'a printed order adds shipping: 2 x 300 + 40');
SELECT pg_temp.raises($q$SELECT public.publication_order('00000000-0000-0000-0000-00000000b8a1', 'print', 1, NULL, NULL, NULL, NULL)$q$,
  NULL, 'a printed order needs an address');
SELECT pg_temp.raises($q$SELECT public.publication_order('00000000-0000-0000-0000-00000000b8a2', 'print', 1, 'a', 'b', NULL, NULL)$q$,
  'format not sold', 'an unpublished title cannot be ordered');
SELECT pg_temp.raises(format('SELECT public.publication_order_pay(%L, %L, NULL, %L)', (SELECT pub_ebook FROM o),
  'transfer', '00000000-0000-0000-0000-00000000b802/recu.pdf'), 'proof required', 'a receipt must be in the buyer''s folder');
SELECT public.publication_order_pay((SELECT pub_ebook FROM o), 'transfer', 'VIR-1',
  '00000000-0000-0000-0000-00000000b803/recu.pdf');
SELECT pg_temp.raises(format('SELECT public.publication_order_admin(%L, %L, NULL, NULL)', (SELECT pub_ebook FROM o), 'confirm'),
  'forbidden', 'a buyer cannot confirm their own payment');
SELECT pg_temp.expect(NOT public.can_download_ebook('livret-test/livret.pdf'), 'no download before payment');

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000b802', true);
SELECT pg_temp.expect((SELECT count(*) = 0 FROM public.publication_orders), 'buyers see only their own orders');
SELECT public.publication_order('00000000-0000-0000-0000-00000000b8a1', 'ebook', 1, NULL, NULL, NULL, NULL);
SELECT pg_temp.expect((SELECT unit_price_mad = 80 AND member_price FROM public.publication_orders),
  'a confirmed League member pays the member price');

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000b801', true);
SELECT public.publication_order_admin((SELECT pub_ebook FROM o), 'confirm', NULL, NULL);
SELECT pg_temp.expect((SELECT status = 'paid' AND invoice_number LIKE 'FAC-UPSY-%-00001'
  FROM public.publication_orders WHERE id = (SELECT pub_ebook FROM o)), 'confirming gives an invoice number');
SELECT pg_temp.raises(format('SELECT public.publication_order_admin(%L, %L, NULL, NULL)', (SELECT pub_print FROM o), 'confirm'),
  'method required', 'recording an in-person payment needs a method');
SELECT public.publication_order_admin((SELECT pub_print FROM o), 'confirm', 'cash', 'Payé au cabinet');
SELECT pg_temp.raises(format('SELECT public.publication_order_admin(%L, %L, NULL, NULL)', (SELECT pub_ebook FROM o), 'ship'),
  'not shippable', 'an ebook is not shipped');
SELECT public.publication_order_admin((SELECT pub_print FROM o), 'ship', NULL, 'Amana 123');
SELECT pg_temp.expect((SELECT status = 'shipped' AND invoice_number LIKE '%-00002'
  FROM public.publication_orders WHERE id = (SELECT pub_print FROM o)), 'a paid print order is shipped; numbers are gapless');

SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000b803', true);
SELECT pg_temp.expect(public.can_download_ebook('livret-test/livret.pdf'), 'the buyer downloads the paid ebook');
SELECT pg_temp.raises(format('SELECT public.publication_order_cancel(%L)', (SELECT pub_ebook FROM o)),
  'not cancellable', 'a paid order cannot be cancelled by the buyer');
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000b802', true);
SELECT pg_temp.expect(NOT public.can_download_ebook('livret-test/livret.pdf'), 'an unpaid buyer cannot download');

ROLLBACK;
