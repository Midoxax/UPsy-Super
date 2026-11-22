-- LSSPM membership (adhésion) on U.Psy.
--
-- A psychologist chooses a membership category and pays the League by bank
-- transfer or deposit (uploading the receipt), or in cash / by cheque
-- recorded by the League. Nothing is granted on a declaration alone: a League
-- reviewer checks the payment, which issues a gapless receipt number and
-- activates the membership. Only then do the benefits apply (LSSPM badge,
-- member prices, three months without U.Psy commission).
--
-- Money belongs to the League: only League accounts (is_league_reviewer,
-- which excludes U.Psy admins) confirm payments and edit amounts and bank
-- details. Payments are never deleted; a refused one keeps no number, so the
-- receipt sequence has no holes (the League's accounting rule).
--
-- Payment natures follow the League's accounting: cotisation (membership
-- fee), formation, don (donation), booklet (publication sale). Each has its
-- own receipt series: REC-COT, REC-FOR, REC-DON, FAC.

CREATE TABLE IF NOT EXISTS public.league_membership_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE CHECK (code ~ '^[a-z0-9_-]{2,40}$'),
  label_fr text NOT NULL,
  label_en text,
  label_ar text,
  description_fr text,
  amount_mad numeric(10, 2) CHECK (amount_mad IS NULL OR amount_mad >= 0),
  period_months integer NOT NULL DEFAULT 12 CHECK (period_months BETWEEN 1 AND 60),
  is_active boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- A category is offered only once the League has set its amount.
  CHECK (NOT is_active OR amount_mad IS NOT NULL)
);

-- One row: the League's bank details shown on the payment page.
CREATE TABLE IF NOT EXISTS public.league_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  bank_name text,
  account_holder text,
  rib text CHECK (rib IS NULL OR rib ~ '^[0-9 ]{20,34}$'),
  instructions_fr text,
  instructions_en text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.league_settings (id, account_holder)
VALUES (true, 'Ligue des Spécialistes de la Santé Psychique et Mentale')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.league_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.league_membership_plans(id),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'rejected', 'cancelled')),
  member_number text UNIQUE,
  starts_on date,
  ends_on date,
  -- U.Psy benefit granted on a first confirmed membership.
  commission_free_until date,
  confirmed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  confirmed_at timestamptz,
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS league_memberships_one_pending
  ON public.league_memberships (user_id) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS league_memberships_user_idx ON public.league_memberships (user_id);

CREATE TABLE IF NOT EXISTS public.league_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  membership_id uuid REFERENCES public.league_memberships(id) ON DELETE SET NULL,
  nature text NOT NULL CHECK (nature IN ('cotisation', 'formation', 'don', 'booklet')),
  method text NOT NULL CHECK (method IN ('transfer', 'deposit', 'cash', 'cheque', 'card')),
  amount_mad numeric(10, 2) NOT NULL CHECK (amount_mad > 0),
  payer_reference text CHECK (payer_reference IS NULL OR length(payer_reference) <= 120),
  proof_path text,
  status text NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'verified', 'rejected')),
  receipt_number text UNIQUE,
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at timestamptz,
  review_note text,
  recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS league_payments_status_idx ON public.league_payments (status, created_at);

CREATE TABLE IF NOT EXISTS public.league_counters (
  prefix text NOT NULL,
  year integer NOT NULL,
  last integer NOT NULL DEFAULT 0,
  PRIMARY KEY (prefix, year)
);

ALTER TABLE public.league_membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_counters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS league_plans_read ON public.league_membership_plans;
CREATE POLICY league_plans_read ON public.league_membership_plans FOR SELECT
  USING (is_active OR public.is_league_reviewer(auth.uid()));
DROP POLICY IF EXISTS league_plans_manage ON public.league_membership_plans;
CREATE POLICY league_plans_manage ON public.league_membership_plans FOR ALL TO authenticated
  USING (public.is_league_reviewer(auth.uid())) WITH CHECK (public.is_league_reviewer(auth.uid()));

DROP POLICY IF EXISTS league_settings_read ON public.league_settings;
CREATE POLICY league_settings_read ON public.league_settings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS league_settings_manage ON public.league_settings;
CREATE POLICY league_settings_manage ON public.league_settings FOR UPDATE TO authenticated
  USING (public.is_league_reviewer(auth.uid())) WITH CHECK (public.is_league_reviewer(auth.uid()));

-- Memberships and payments: read your own; the League reads all. All writes
-- go through the functions below.
DROP POLICY IF EXISTS league_memberships_read ON public.league_memberships;
CREATE POLICY league_memberships_read ON public.league_memberships FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_league_reviewer(auth.uid()));
DROP POLICY IF EXISTS league_payments_read ON public.league_payments;
CREATE POLICY league_payments_read ON public.league_payments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_league_reviewer(auth.uid()));

GRANT SELECT ON public.league_membership_plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.league_membership_plans TO authenticated;
GRANT SELECT, UPDATE ON public.league_settings TO authenticated;
GRANT SELECT ON public.league_memberships TO authenticated;
GRANT SELECT ON public.league_payments TO authenticated;
-- Receipt counters: written only by league_next_number(); no client access.
GRANT SELECT ON public.league_counters TO service_role;

CREATE OR REPLACE FUNCTION public.league_touch() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;
DROP TRIGGER IF EXISTS league_plans_touch ON public.league_membership_plans;
CREATE TRIGGER league_plans_touch BEFORE UPDATE ON public.league_membership_plans
  FOR EACH ROW EXECUTE FUNCTION public.league_touch();
DROP TRIGGER IF EXISTS league_settings_touch ON public.league_settings;
CREATE TRIGGER league_settings_touch BEFORE UPDATE ON public.league_settings
  FOR EACH ROW EXECUTE FUNCTION public.league_touch();
DROP TRIGGER IF EXISTS league_memberships_touch ON public.league_memberships;
CREATE TRIGGER league_memberships_touch BEFORE UPDATE ON public.league_memberships
  FOR EACH ROW EXECUTE FUNCTION public.league_touch();

-- Next number in a series, e.g. REC-COT-2026-00001. Row-locked: concurrent
-- confirmations cannot take the same number or skip one.
CREATE OR REPLACE FUNCTION public.league_next_number(_prefix text) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _y integer := extract(year FROM now())::integer; _n integer;
BEGIN
  INSERT INTO public.league_counters (prefix, year, last) VALUES (_prefix, _y, 0)
  ON CONFLICT (prefix, year) DO NOTHING;
  UPDATE public.league_counters SET last = last + 1
  WHERE prefix = _prefix AND year = _y RETURNING last INTO _n;
  RETURN _prefix || '-' || _y || '-' || lpad(_n::text, 5, '0');
END $$;

-- Whether a user currently holds a confirmed, unexpired membership.
CREATE OR REPLACE FUNCTION public.is_league_member(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.league_memberships
                 WHERE user_id = _uid AND status = 'active' AND ends_on >= current_date);
$$;

-- Apply for membership in a category; returns the pending membership.
CREATE OR REPLACE FUNCTION public.league_join(_plan uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.league_membership_plans WHERE id = _plan AND is_active) THEN
    RAISE EXCEPTION 'plan unavailable';
  END IF;
  SELECT id INTO _id FROM public.league_memberships WHERE user_id = _uid AND status = 'pending';
  IF _id IS NOT NULL THEN
    UPDATE public.league_memberships SET plan_id = _plan WHERE id = _id;
    RETURN _id;
  END IF;
  -- Renewal opens 60 days before the current period ends.
  IF EXISTS (SELECT 1 FROM public.league_memberships WHERE user_id = _uid AND status = 'active'
             AND ends_on > current_date + 60) THEN
    RAISE EXCEPTION 'already a member';
  END IF;
  INSERT INTO public.league_memberships (user_id, plan_id) VALUES (_uid, _plan) RETURNING id INTO _id;
  RETURN _id;
END $$;

-- The member declares a transfer or deposit, with the receipt they uploaded
-- to league-proofs/<their id>/.
CREATE OR REPLACE FUNCTION public.league_submit_payment(
  _membership uuid, _method text, _amount numeric, _reference text, _proof_path text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;
  IF _method NOT IN ('transfer', 'deposit') THEN RAISE EXCEPTION 'invalid method'; END IF;
  IF _proof_path IS NULL OR _proof_path NOT LIKE _uid::text || '/%' THEN
    RAISE EXCEPTION 'proof required';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.league_memberships
                 WHERE id = _membership AND user_id = _uid AND status = 'pending') THEN
    RAISE EXCEPTION 'no pending membership';
  END IF;
  IF EXISTS (SELECT 1 FROM public.league_payments
             WHERE membership_id = _membership AND status = 'submitted') THEN
    RAISE EXCEPTION 'payment already under review';
  END IF;
  INSERT INTO public.league_payments (user_id, membership_id, nature, method, amount_mad,
                                      payer_reference, proof_path)
  VALUES (_uid, _membership, 'cotisation', _method, _amount, nullif(trim(_reference), ''), _proof_path)
  RETURNING id INTO _id;
  RETURN _id;
END $$;

-- Confirms a membership after a verified payment.
CREATE OR REPLACE FUNCTION public.league_activate(_membership uuid, _by uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m public.league_memberships; _months integer; _start date; _first boolean;
BEGIN
  SELECT * INTO m FROM public.league_memberships WHERE id = _membership FOR UPDATE;
  IF m.status <> 'pending' THEN RETURN; END IF;
  SELECT period_months INTO _months FROM public.league_membership_plans WHERE id = m.plan_id;
  -- A renewal starts the day after the current period ends.
  SELECT greatest(current_date, max(ends_on) + 1) INTO _start
  FROM public.league_memberships WHERE user_id = m.user_id AND status = 'active';
  _start := coalesce(_start, current_date);
  _first := NOT EXISTS (SELECT 1 FROM public.league_memberships
                        WHERE user_id = m.user_id AND status = 'active');
  UPDATE public.league_memberships SET
    status = 'active',
    member_number = coalesce(
      (SELECT member_number FROM public.league_memberships
       WHERE user_id = m.user_id AND member_number IS NOT NULL ORDER BY created_at LIMIT 1),
      public.league_next_number('LSSPM')),
    starts_on = _start,
    ends_on = (_start + make_interval(months => _months))::date - 1,
    commission_free_until = CASE WHEN _first THEN (current_date + interval '3 months')::date END,
    confirmed_by = _by,
    confirmed_at = now()
  WHERE id = _membership;
END $$;

-- The League accepts or refuses a declared payment.
CREATE OR REPLACE FUNCTION public.league_review_payment(_payment uuid, _approve boolean, _note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); p public.league_payments;
BEGIN
  IF NOT public.is_league_reviewer(_uid) THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT * INTO p FROM public.league_payments WHERE id = _payment FOR UPDATE;
  IF NOT FOUND OR p.status <> 'submitted' THEN RAISE EXCEPTION 'not reviewable'; END IF;
  IF _approve THEN
    UPDATE public.league_payments SET status = 'verified', verified_by = _uid, verified_at = now(),
      review_note = nullif(trim(_note), ''),
      receipt_number = public.league_next_number(
        CASE p.nature WHEN 'cotisation' THEN 'REC-COT' WHEN 'formation' THEN 'REC-FOR'
                      WHEN 'don' THEN 'REC-DON' ELSE 'FAC' END)
    WHERE id = _payment;
    IF p.membership_id IS NOT NULL AND p.nature = 'cotisation' THEN
      PERFORM public.league_activate(p.membership_id, _uid);
    END IF;
  ELSE
    UPDATE public.league_payments SET status = 'rejected', verified_by = _uid, verified_at = now(),
      review_note = nullif(trim(_note), '')
    WHERE id = _payment;
  END IF;
END $$;

-- The League records a payment received in person (cash, cheque) or seen on
-- its account, for a pending membership; it is verified at once.
CREATE OR REPLACE FUNCTION public.league_record_payment(
  _membership uuid, _method text, _amount numeric, _reference text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); m public.league_memberships; _id uuid;
BEGIN
  IF NOT public.is_league_reviewer(_uid) THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _method NOT IN ('cash', 'cheque', 'transfer', 'deposit') THEN RAISE EXCEPTION 'invalid method'; END IF;
  SELECT * INTO m FROM public.league_memberships WHERE id = _membership;
  IF NOT FOUND OR m.status <> 'pending' THEN RAISE EXCEPTION 'no pending membership'; END IF;
  INSERT INTO public.league_payments (user_id, membership_id, nature, method, amount_mad,
                                      payer_reference, recorded_by)
  VALUES (m.user_id, _membership, 'cotisation', _method, _amount, nullif(trim(_reference), ''), _uid)
  RETURNING id INTO _id;
  PERFORM public.league_review_payment(_id, true, NULL);
  RETURN _id;
END $$;

-- The League's desk: every membership with the member's name and contact and
-- the latest payment.
CREATE OR REPLACE FUNCTION public.league_membership_desk()
RETURNS TABLE (membership_id uuid, user_id uuid, full_name text, email text, plan_label text,
               plan_amount numeric, status text, member_number text, starts_on date, ends_on date,
               created_at timestamptz, payment_id uuid, payment_status text, payment_method text,
               payment_amount numeric, payer_reference text, proof_path text, receipt_number text,
               paid_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_league_reviewer(auth.uid()) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT m.id, m.user_id, p.full_name, u.email::text, pl.label_fr, pl.amount_mad, m.status,
         m.member_number, m.starts_on, m.ends_on, m.created_at,
         lp.id, lp.status, lp.method, lp.amount_mad, lp.payer_reference, lp.proof_path,
         lp.receipt_number, lp.created_at
  FROM public.league_memberships m
  JOIN auth.users u ON u.id = m.user_id
  LEFT JOIN public.profiles p ON p.id = m.user_id
  JOIN public.league_membership_plans pl ON pl.id = m.plan_id
  LEFT JOIN LATERAL (SELECT * FROM public.league_payments x WHERE x.membership_id = m.id
                     ORDER BY x.created_at DESC LIMIT 1) lp ON true
  ORDER BY (lp.status = 'submitted') DESC NULLS LAST, m.created_at DESC;
END $$;

REVOKE ALL ON FUNCTION public.league_next_number(text), public.league_activate(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_league_member(uuid), public.league_join(uuid),
  public.league_submit_payment(uuid, text, numeric, text, text),
  public.league_review_payment(uuid, boolean, text),
  public.league_record_payment(uuid, text, numeric, text),
  public.league_membership_desk() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_league_member(uuid), public.league_join(uuid),
  public.league_submit_payment(uuid, text, numeric, text, text),
  public.league_review_payment(uuid, boolean, text),
  public.league_record_payment(uuid, text, numeric, text),
  public.league_membership_desk() TO authenticated;

-- Payment receipts: members upload into their own folder; the League reads.
INSERT INTO storage.buckets (id, name, public) VALUES ('league-proofs', 'league-proofs', false)
ON CONFLICT (id) DO UPDATE SET public = false;
DROP POLICY IF EXISTS "Members upload own league proofs" ON storage.objects;
CREATE POLICY "Members upload own league proofs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'league-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Members and League read league proofs" ON storage.objects;
CREATE POLICY "Members and League read league proofs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'league-proofs'
         AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_league_reviewer(auth.uid())));

-- Two starting categories; the League sets the amounts and activates them.
INSERT INTO public.league_membership_plans (code, label_fr, label_en, label_ar, position) VALUES
  ('praticien', 'Psychologue praticien(ne)', 'Practising psychologist', 'أخصائي نفسي ممارس', 1),
  ('etudiant', 'Étudiant(e) / jeune diplômé(e)', 'Student / recent graduate', 'طالب / خريج حديث', 2)
ON CONFLICT (code) DO NOTHING;
