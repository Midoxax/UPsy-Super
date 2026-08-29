-- Phase 3: invoices, payments, legal documents & acceptances

CREATE TABLE public.invoice_counters (
  series      text NOT NULL,
  year        int  NOT NULL,
  last_value  int  NOT NULL DEFAULT 0,
  PRIMARY KEY (series, year)
);
GRANT ALL ON public.invoice_counters TO service_role;
ALTER TABLE public.invoice_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoice_counters_admin_read" ON public.invoice_counters
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.invoices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number          text NOT NULL UNIQUE,
  series          text NOT NULL DEFAULT 'UPSY',
  issued_at       date NOT NULL DEFAULT current_date,
  due_at          date,
  contact_id      uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  organisation_id uuid,
  booking_id      uuid,
  kind            text NOT NULL DEFAULT 'client_session',
  currency        text NOT NULL DEFAULT 'MAD',
  subtotal_mad    numeric(12,2) NOT NULL,
  vat_mad         numeric(12,2) NOT NULL DEFAULT 0,
  total_mad       numeric(12,2) NOT NULL,
  status          text NOT NULL DEFAULT 'issued',
  payment_ref     text NOT NULL UNIQUE,
  pdf_path        text,
  legal_mentions  text NOT NULL DEFAULT '',
  notes           text,
  created_by      uuid,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invoices_kind_chk CHECK (kind IN ('client_session','commission','b2b_program','training')),
  CONSTRAINT invoices_status_chk CHECK (status IN ('issued','paid','partially_paid','void')),
  CONSTRAINT invoices_amounts_chk CHECK (subtotal_mad >= 0 AND vat_mad >= 0 AND total_mad >= 0)
);
CREATE INDEX invoices_contact_idx ON public.invoices (contact_id);
CREATE INDEX invoices_status_idx  ON public.invoices (status, issued_at DESC);

CREATE TABLE public.payments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id    uuid REFERENCES public.invoices(id) ON DELETE RESTRICT,
  amount_mad    numeric(12,2) NOT NULL CHECK (amount_mad > 0),
  received_at   date NOT NULL DEFAULT current_date,
  method        text NOT NULL DEFAULT 'bank_transfer',
  bank_ref      text,
  matched_by    uuid,
  matched_at    timestamptz NOT NULL DEFAULT now(),
  raw_statement jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payments_invoice_idx ON public.payments (invoice_id);

GRANT SELECT ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_owner_read" ON public.invoices
  FOR SELECT TO authenticated
  USING (
    contact_id IN (SELECT id FROM public.crm_contacts WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );
CREATE POLICY "invoices_admin_write" ON public.invoices
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "invoices_admin_update" ON public.invoices
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "payments_owner_read" ON public.payments
  FOR SELECT TO authenticated
  USING (
    invoice_id IN (
      SELECT i.id FROM public.invoices i
      JOIN public.crm_contacts c ON c.id = i.contact_id
      WHERE c.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );
CREATE POLICY "payments_admin_write" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Invoices are never deleted; amounts on a paid invoice are frozen.
CREATE OR REPLACE FUNCTION public.invoices_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Invoices cannot be deleted. Set status = ''void'' instead.';
  END IF;
  IF OLD.number <> NEW.number OR OLD.payment_ref <> NEW.payment_ref THEN
    RAISE EXCEPTION 'Invoice number and payment reference are immutable.';
  END IF;
  IF OLD.status = 'paid' AND (OLD.total_mad <> NEW.total_mad OR OLD.subtotal_mad <> NEW.subtotal_mad) THEN
    RAISE EXCEPTION 'A paid invoice cannot be re-priced.';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER invoices_guard_upd BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.invoices_guard();
CREATE TRIGGER invoices_guard_del BEFORE DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.invoices_guard();

-- Gapless numbering + issue, admin only.
CREATE OR REPLACE FUNCTION public.issue_invoice(
  _contact_id uuid,
  _subtotal_mad numeric,
  _kind text DEFAULT 'client_session',
  _booking_id uuid DEFAULT NULL,
  _organisation_id uuid DEFAULT NULL,
  _due_days int DEFAULT 7,
  _legal_mentions text DEFAULT 'TVA non applicable — régime de l''auto-entrepreneur (art. 247-XXV CGI). Montants en MAD.',
  _notes text DEFAULT NULL
)
RETURNS public.invoices
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year int := EXTRACT(YEAR FROM current_date)::int;
  v_next int;
  v_number text;
  v_ref text;
  v_row public.invoices;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can issue invoices.';
  END IF;
  IF _subtotal_mad IS NULL OR _subtotal_mad <= 0 THEN
    RAISE EXCEPTION 'Invoice amount must be positive.';
  END IF;

  INSERT INTO public.invoice_counters (series, year, last_value)
  VALUES ('UPSY', v_year, 1)
  ON CONFLICT (series, year) DO UPDATE SET last_value = public.invoice_counters.last_value + 1
  RETURNING last_value INTO v_next;

  v_number := format('UPSY-%s-%s', v_year, lpad(v_next::text, 6, '0'));
  v_ref := v_number;

  INSERT INTO public.invoices (
    number, series, issued_at, due_at, contact_id, organisation_id, booking_id,
    kind, subtotal_mad, vat_mad, total_mad, payment_ref, legal_mentions, notes, created_by
  ) VALUES (
    v_number, 'UPSY', current_date, current_date + make_interval(days => COALESCE(_due_days, 7)),
    _contact_id, _organisation_id, _booking_id, _kind,
    _subtotal_mad, 0, _subtotal_mad, v_ref, _legal_mentions, _notes, auth.uid()
  ) RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;
REVOKE ALL ON FUNCTION public.issue_invoice(uuid,numeric,text,uuid,uuid,int,text,text) FROM public;
GRANT EXECUTE ON FUNCTION public.issue_invoice(uuid,numeric,text,uuid,uuid,int,text,text) TO authenticated, service_role;

-- Record a payment and recalculate invoice status, admin only.
CREATE OR REPLACE FUNCTION public.record_payment(
  _invoice_id uuid,
  _amount_mad numeric,
  _received_at date DEFAULT current_date,
  _bank_ref text DEFAULT NULL,
  _method text DEFAULT 'bank_transfer'
)
RETURNS public.invoices
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_paid numeric;
  v_row public.invoices;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can record payments.';
  END IF;

  INSERT INTO public.payments (invoice_id, amount_mad, received_at, bank_ref, method, matched_by)
  VALUES (_invoice_id, _amount_mad, COALESCE(_received_at, current_date), _bank_ref, COALESCE(_method,'bank_transfer'), auth.uid());

  SELECT COALESCE(SUM(amount_mad), 0) INTO v_paid FROM public.payments WHERE invoice_id = _invoice_id;

  UPDATE public.invoices
     SET status = CASE
       WHEN status = 'void' THEN 'void'
       WHEN v_paid >= total_mad THEN 'paid'
       WHEN v_paid > 0 THEN 'partially_paid'
       ELSE status END
   WHERE id = _invoice_id
   RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;
REVOKE ALL ON FUNCTION public.record_payment(uuid,numeric,date,text,text) FROM public;
GRANT EXECUTE ON FUNCTION public.record_payment(uuid,numeric,date,text,text) TO authenticated, service_role;

-- Revenue ceiling tracker (auto-entrepreneur regime).
CREATE OR REPLACE FUNCTION public.revenue_ytd_mad()
RETURNS TABLE (year int, collected_mad numeric, issued_mad numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXTRACT(YEAR FROM current_date)::int,
         COALESCE((SELECT SUM(p.amount_mad) FROM public.payments p
                   JOIN public.invoices i ON i.id = p.invoice_id
                   WHERE EXTRACT(YEAR FROM p.received_at) = EXTRACT(YEAR FROM current_date)
                     AND i.status <> 'void'), 0),
         COALESCE((SELECT SUM(i.total_mad) FROM public.invoices i
                   WHERE EXTRACT(YEAR FROM i.issued_at) = EXTRACT(YEAR FROM current_date)
                     AND i.status <> 'void'), 0)
  WHERE public.has_role(auth.uid(), 'admin'::app_role);
$$;
REVOKE ALL ON FUNCTION public.revenue_ytd_mad() FROM public;
GRANT EXECUTE ON FUNCTION public.revenue_ytd_mad() TO authenticated, service_role;

-- Legal documents & acceptances
CREATE TABLE public.legal_documents (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text NOT NULL,
  version        text NOT NULL,
  locale         text NOT NULL,
  title          text NOT NULL,
  body_md        text NOT NULL,
  effective_from date NOT NULL DEFAULT current_date,
  published      boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slug, version, locale)
);
CREATE INDEX legal_documents_slug_idx ON public.legal_documents (slug, locale, effective_from DESC);

CREATE TABLE public.legal_acceptances (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid,
  contact_id  uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  document_id uuid NOT NULL REFERENCES public.legal_documents(id) ON DELETE RESTRICT,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip          inet,
  user_agent  text,
  method      text NOT NULL DEFAULT 'checkbox',
  CONSTRAINT legal_acceptances_method_chk CHECK (method IN ('checkbox','signature','click_through'))
);
CREATE INDEX legal_acceptances_user_idx ON public.legal_acceptances (user_id, accepted_at DESC);

GRANT SELECT ON public.legal_documents TO anon, authenticated;
GRANT ALL ON public.legal_documents TO service_role;
GRANT SELECT, INSERT ON public.legal_acceptances TO authenticated;
GRANT ALL ON public.legal_acceptances TO service_role;

ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "legal_documents_public_read" ON public.legal_documents
  FOR SELECT TO anon, authenticated
  USING (published = true AND effective_from <= current_date);
CREATE POLICY "legal_documents_admin_all" ON public.legal_documents
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "legal_acceptances_self_read" ON public.legal_acceptances
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "legal_acceptances_self_insert" ON public.legal_acceptances
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());