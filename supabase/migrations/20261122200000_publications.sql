-- Publications (booklets): printed and ebook editions, member prices.
--
-- Each publication may be sold printed (shipped) and/or as an ebook (PDF).
-- Four prices, set by U.Psy admins: printed and ebook, each with a League
-- member price that may not exceed the public one. The order function
-- computes the price on the server: the member price applies only to a
-- confirmed, unexpired League membership (is_league_member), never to a
-- client claim.
--
-- Payment follows the League flow: bank transfer or deposit with an
-- uploaded receipt, or cash / cheque recorded by an admin. An admin confirms
-- the payment, which gives a gapless invoice number (FAC-UPSY-YYYY-#####).
-- The ebook file is private: a buyer can download it only once their ebook
-- order is paid.

CREATE TABLE IF NOT EXISTS public.publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,80}$'),
  title text NOT NULL,
  title_fr text,
  title_ar text,
  description text,
  description_fr text,
  description_ar text,
  author text,
  pages integer CHECK (pages IS NULL OR pages > 0),
  isbn text,
  cover_url text,
  ebook_path text,
  price_print numeric(10, 2) CHECK (price_print IS NULL OR price_print > 0),
  price_print_member numeric(10, 2) CHECK (price_print_member IS NULL OR price_print_member > 0),
  price_ebook numeric(10, 2) CHECK (price_ebook IS NULL OR price_ebook > 0),
  price_ebook_member numeric(10, 2) CHECK (price_ebook_member IS NULL OR price_ebook_member > 0),
  is_published boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (price_print_member IS NULL OR (price_print IS NOT NULL AND price_print_member <= price_print)),
  CHECK (price_ebook_member IS NULL OR (price_ebook IS NOT NULL AND price_ebook_member <= price_ebook))
);

-- One row: where buyers pay U.Psy.
CREATE TABLE IF NOT EXISTS public.shop_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  bank_name text,
  account_holder text,
  rib text CHECK (rib IS NULL OR rib ~ '^[0-9 ]{20,34}$'),
  instructions_fr text,
  shipping_fee_mad numeric(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_fee_mad >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.shop_settings (id, account_holder) VALUES (true, 'U.Psy') ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.publication_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  publication_id uuid NOT NULL REFERENCES public.publications(id) ON DELETE RESTRICT,
  format text NOT NULL CHECK (format IN ('print', 'ebook')),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 50),
  unit_price_mad numeric(10, 2) NOT NULL,
  member_price boolean NOT NULL DEFAULT false,
  shipping_mad numeric(10, 2) NOT NULL DEFAULT 0,
  total_mad numeric(10, 2) NOT NULL,
  ship_name text,
  ship_address text CHECK (ship_address IS NULL OR length(ship_address) <= 500),
  ship_city text,
  ship_phone text,
  status text NOT NULL DEFAULT 'awaiting_payment'
    CHECK (status IN ('awaiting_payment', 'payment_submitted', 'paid', 'shipped', 'cancelled')),
  pay_method text CHECK (pay_method IS NULL OR pay_method IN ('transfer', 'deposit', 'cash', 'cheque', 'card')),
  pay_reference text CHECK (pay_reference IS NULL OR length(pay_reference) <= 120),
  proof_path text,
  invoice_number text UNIQUE,
  paid_at timestamptz,
  shipped_at timestamptz,
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (format = 'ebook' OR (ship_address IS NOT NULL AND ship_name IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS publication_orders_user_idx ON public.publication_orders (user_id);
CREATE INDEX IF NOT EXISTS publication_orders_status_idx ON public.publication_orders (status, created_at);

CREATE TABLE IF NOT EXISTS public.shop_counters (
  year integer PRIMARY KEY,
  last integer NOT NULL DEFAULT 0
);

ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_counters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS publications_read ON public.publications;
CREATE POLICY publications_read ON public.publications FOR SELECT USING (is_published);
DROP POLICY IF EXISTS publications_admin ON public.publications;
CREATE POLICY publications_admin ON public.publications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS shop_settings_read ON public.shop_settings;
CREATE POLICY shop_settings_read ON public.shop_settings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS shop_settings_admin ON public.shop_settings;
CREATE POLICY shop_settings_admin ON public.shop_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS publication_orders_read ON public.publication_orders;
CREATE POLICY publication_orders_read ON public.publication_orders FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.publications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.publications TO authenticated;
GRANT SELECT, UPDATE ON public.shop_settings TO authenticated;
GRANT SELECT ON public.publication_orders TO authenticated;
-- Invoice counters: written only by shop_next_invoice(); no client access.
GRANT SELECT ON public.shop_counters TO service_role;

CREATE OR REPLACE FUNCTION public.publications_touch() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;
DROP TRIGGER IF EXISTS publications_touch ON public.publications;
CREATE TRIGGER publications_touch BEFORE UPDATE ON public.publications
  FOR EACH ROW EXECUTE FUNCTION public.publications_touch();
DROP TRIGGER IF EXISTS publication_orders_touch ON public.publication_orders;
CREATE TRIGGER publication_orders_touch BEFORE UPDATE ON public.publication_orders
  FOR EACH ROW EXECUTE FUNCTION public.publications_touch();

CREATE OR REPLACE FUNCTION public.shop_next_invoice() RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _y integer := extract(year FROM now())::integer; _n integer;
BEGIN
  INSERT INTO public.shop_counters (year, last) VALUES (_y, 0) ON CONFLICT (year) DO NOTHING;
  UPDATE public.shop_counters SET last = last + 1 WHERE year = _y RETURNING last INTO _n;
  RETURN 'FAC-UPSY-' || _y || '-' || lpad(_n::text, 5, '0');
END $$;

-- The buyer's price for one format: the member price for a confirmed
-- League member when there is one, else the public price. Null if the
-- format is not sold.
CREATE OR REPLACE FUNCTION public.publication_price(_pub uuid, _format text, _uid uuid)
RETURNS TABLE (price numeric, member boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN m AND mp IS NOT NULL THEN mp ELSE pp END, (m AND mp IS NOT NULL)
  FROM (SELECT CASE _format WHEN 'print' THEN p.price_print ELSE p.price_ebook END AS pp,
               CASE _format WHEN 'print' THEN p.price_print_member ELSE p.price_ebook_member END AS mp,
               (_uid IS NOT NULL AND public.is_league_member(_uid)) AS m
        FROM public.publications p WHERE p.id = _pub AND p.is_published) x;
$$;

-- Places an order at the server-computed price.
CREATE OR REPLACE FUNCTION public.publication_order(
  _pub uuid, _format text, _quantity integer,
  _ship_name text, _ship_address text, _ship_city text, _ship_phone text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _price numeric; _member boolean; _ship numeric := 0; _id uuid;
  _qty integer := CASE WHEN _format = 'ebook' THEN 1 ELSE greatest(1, coalesce(_quantity, 1)) END;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;
  IF _format NOT IN ('print', 'ebook') THEN RAISE EXCEPTION 'invalid format'; END IF;
  SELECT price, member INTO _price, _member FROM public.publication_price(_pub, _format, _uid);
  IF _price IS NULL THEN RAISE EXCEPTION 'format not sold'; END IF;
  IF _format = 'print' THEN
    SELECT shipping_fee_mad INTO _ship FROM public.shop_settings;
  END IF;
  INSERT INTO public.publication_orders (user_id, publication_id, format, quantity, unit_price_mad,
    member_price, shipping_mad, total_mad, ship_name, ship_address, ship_city, ship_phone)
  VALUES (_uid, _pub, _format, _qty, _price, _member, coalesce(_ship, 0),
          _price * _qty + coalesce(_ship, 0),
          CASE WHEN _format = 'print' THEN nullif(trim(_ship_name), '') END,
          CASE WHEN _format = 'print' THEN nullif(trim(_ship_address), '') END,
          CASE WHEN _format = 'print' THEN nullif(trim(_ship_city), '') END,
          CASE WHEN _format = 'print' THEN nullif(trim(_ship_phone), '') END)
  RETURNING id INTO _id;
  RETURN _id;
END $$;

-- The buyer declares a transfer or deposit with their uploaded receipt.
CREATE OR REPLACE FUNCTION public.publication_order_pay(
  _order uuid, _method text, _reference text, _proof_path text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _method NOT IN ('transfer', 'deposit') THEN RAISE EXCEPTION 'invalid method'; END IF;
  IF _proof_path IS NULL OR _proof_path NOT LIKE _uid::text || '/%' THEN RAISE EXCEPTION 'proof required'; END IF;
  UPDATE public.publication_orders SET status = 'payment_submitted', pay_method = _method,
    pay_reference = nullif(trim(_reference), ''), proof_path = _proof_path, review_note = NULL
  WHERE id = _order AND user_id = _uid AND status = 'awaiting_payment';
  IF NOT FOUND THEN RAISE EXCEPTION 'not payable'; END IF;
END $$;

-- Admin: confirm or refuse a declared payment, record one received in
-- person, mark a printed order shipped, or cancel.
CREATE OR REPLACE FUNCTION public.publication_order_admin(
  _order uuid, _action text, _method text, _note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o public.publication_orders;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT * INTO o FROM public.publication_orders WHERE id = _order FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'not found'; END IF;
  IF _action = 'confirm' THEN
    IF o.status NOT IN ('payment_submitted', 'awaiting_payment') THEN RAISE EXCEPTION 'not payable'; END IF;
    IF o.status = 'awaiting_payment' AND (_method IS NULL OR _method NOT IN ('cash', 'cheque', 'transfer', 'deposit')) THEN
      RAISE EXCEPTION 'method required';
    END IF;
    UPDATE public.publication_orders SET status = 'paid', paid_at = now(),
      pay_method = coalesce(_method, pay_method), invoice_number = public.shop_next_invoice(),
      review_note = nullif(trim(_note), '')
    WHERE id = _order;
  ELSIF _action = 'reject' THEN
    IF o.status <> 'payment_submitted' THEN RAISE EXCEPTION 'not reviewable'; END IF;
    UPDATE public.publication_orders SET status = 'awaiting_payment', review_note = nullif(trim(_note), '')
    WHERE id = _order;
  ELSIF _action = 'ship' THEN
    IF o.status <> 'paid' OR o.format <> 'print' THEN RAISE EXCEPTION 'not shippable'; END IF;
    UPDATE public.publication_orders SET status = 'shipped', shipped_at = now(),
      review_note = nullif(trim(_note), '') WHERE id = _order;
  ELSIF _action = 'cancel' THEN
    IF o.status NOT IN ('awaiting_payment', 'payment_submitted') THEN RAISE EXCEPTION 'not cancellable'; END IF;
    UPDATE public.publication_orders SET status = 'cancelled', review_note = nullif(trim(_note), '')
    WHERE id = _order;
  ELSE
    RAISE EXCEPTION 'unknown action';
  END IF;
END $$;

-- The buyer cancels their own unpaid order.
CREATE OR REPLACE FUNCTION public.publication_order_cancel(_order uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.publication_orders SET status = 'cancelled'
  WHERE id = _order AND user_id = auth.uid() AND status IN ('awaiting_payment', 'payment_submitted');
  IF NOT FOUND THEN RAISE EXCEPTION 'not cancellable'; END IF;
END $$;

-- Whether the caller may download this ebook file.
CREATE OR REPLACE FUNCTION public.can_download_ebook(_path text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin') OR EXISTS (
    SELECT 1 FROM public.publication_orders o JOIN public.publications p ON p.id = o.publication_id
    WHERE o.user_id = auth.uid() AND o.format = 'ebook' AND o.status = 'paid' AND p.ebook_path = _path);
$$;

REVOKE ALL ON FUNCTION public.shop_next_invoice() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.publication_price(uuid, text, uuid),
  public.publication_order(uuid, text, integer, text, text, text, text),
  public.publication_order_pay(uuid, text, text, text),
  public.publication_order_admin(uuid, text, text, text),
  public.publication_order_cancel(uuid), public.can_download_ebook(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.publication_order(uuid, text, integer, text, text, text, text),
  public.publication_order_pay(uuid, text, text, text),
  public.publication_order_admin(uuid, text, text, text),
  public.publication_order_cancel(uuid), public.can_download_ebook(text) TO authenticated;

-- Covers are public images; ebooks and payment receipts are private.
INSERT INTO storage.buckets (id, name, public) VALUES
  ('publication-covers', 'publication-covers', true),
  ('publication-files', 'publication-files', false),
  ('shop-proofs', 'shop-proofs', false)
ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Admins manage publication covers" ON storage.objects;
CREATE POLICY "Admins manage publication covers" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'publication-covers' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'publication-covers' AND public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins manage ebook files" ON storage.objects;
CREATE POLICY "Admins manage ebook files" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'publication-files' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'publication-files' AND public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Buyers download paid ebooks" ON storage.objects;
CREATE POLICY "Buyers download paid ebooks" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'publication-files' AND public.can_download_ebook(name));
DROP POLICY IF EXISTS "Buyers upload own shop proofs" ON storage.objects;
CREATE POLICY "Buyers upload own shop proofs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'shop-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Buyers and admins read shop proofs" ON storage.objects;
CREATE POLICY "Buyers and admins read shop proofs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'shop-proofs'
         AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')));
