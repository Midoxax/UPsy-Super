-- Pay by bank transfer or cash transfer (CashPlus, Wafacash), with a receipt.
--
-- Card processors that pay out to a Moroccan business (CMI) need a merchant
-- contract; until then the client transfers the session fee to UPSY's
-- account, uploads the receipt, and an admin checks it against the bank
-- statement. Accepting a receipt marks the booking paid and records the
-- transaction. Paying at the session stays possible.

-- 1. Where to send money. One row, edited by admins, read by signed-in users.
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  account_holder text,
  bank_name text,
  rib text,
  iban text,
  swift text,
  cash_recipient text,          -- name to give at CashPlus / Wafacash
  cash_phone text,
  instructions text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.payment_settings (id) VALUES (true) ON CONFLICT DO NOTHING;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Signed-in users read payment settings" ON public.payment_settings;
CREATE POLICY "Signed-in users read payment settings" ON public.payment_settings
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins edit payment settings" ON public.payment_settings;
CREATE POLICY "Admins edit payment settings" ON public.payment_settings
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
GRANT SELECT, UPDATE ON public.payment_settings TO authenticated;

-- 2. Receipts. The client writes one per attempt; only admins review.
CREATE TABLE IF NOT EXISTS public.payment_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  method text NOT NULL CHECK (method IN ('bank_transfer', 'cashplus', 'wafacash')),
  reference text,
  amount_mad numeric(10, 2),
  file_path text NOT NULL,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'accepted', 'rejected')),
  review_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS payment_proofs_one_open
  ON public.payment_proofs (booking_id) WHERE status IN ('submitted', 'accepted');
CREATE INDEX IF NOT EXISTS payment_proofs_status_idx ON public.payment_proofs (status, created_at);

ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Clients submit receipts for their bookings" ON public.payment_proofs;
CREATE POLICY "Clients submit receipts for their bookings" ON public.payment_proofs
  FOR INSERT TO authenticated
  WITH CHECK (
    patient_id = auth.uid()
    AND status = 'submitted' AND reviewed_by IS NULL AND reviewed_at IS NULL
    AND file_path LIKE auth.uid()::text || '/payments/' || booking_id::text || '/%'
    AND EXISTS (SELECT 1 FROM public.bookings b
                WHERE b.id = booking_id AND b.patient_id = auth.uid()
                  AND b.status IN ('pending', 'confirmed')
                  AND b.payment_status = 'unpaid')
  );
DROP POLICY IF EXISTS "Clients, their specialist and admins read receipts" ON public.payment_proofs;
CREATE POLICY "Clients, their specialist and admins read receipts" ON public.payment_proofs
  FOR SELECT TO authenticated
  USING (
    patient_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.bookings b
               WHERE b.id = booking_id AND b.psychologist_id = auth.uid())
  );
GRANT SELECT, INSERT ON public.payment_proofs TO authenticated;

-- Receipt files live in the client's own folder of user-documents
-- ({patient}/payments/{booking}/...), which the client can already write.
-- Admins and the booking's specialist may read them.
DROP POLICY IF EXISTS "Admins and specialist read payment receipts" ON storage.objects;
CREATE POLICY "Admins and specialist read payment receipts" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'user-documents'
    AND (storage.foldername(name))[2] = 'payments'
    AND (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (SELECT 1 FROM public.bookings b
                 WHERE b.id::text = (storage.foldername(name))[3]
                   AND b.psychologist_id = auth.uid())
    )
  );

-- 3. Admins hear about new receipts.
CREATE OR REPLACE FUNCTION public.payment_proofs_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, body, action_url, metadata)
  SELECT r.user_id, 'payment_receipt', 'Payment receipt to check',
         'A client uploaded a ' || replace(NEW.method, '_', ' ') || ' receipt'
           || coalesce(' of ' || NEW.amount_mad || ' MAD', '') || '.',
         '/admin?tab=finance', jsonb_build_object('proof_id', NEW.id, 'booking_id', NEW.booking_id)
  FROM user_roles r WHERE r.role = 'admin';
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS payment_proofs_notify_trg ON public.payment_proofs;
CREATE TRIGGER payment_proofs_notify_trg
  AFTER INSERT ON public.payment_proofs
  FOR EACH ROW EXECUTE FUNCTION public.payment_proofs_notify();

-- 4. Review. Accepting marks the booking paid and records the transaction.
-- chisle: no commission split yet; set it when payouts are automated.
CREATE OR REPLACE FUNCTION public.review_payment_proof(p_proof_id uuid, p_accept boolean, p_note text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _p payment_proofs%ROWTYPE;
  _b bookings%ROWTYPE;
  _amount numeric;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'admins only' USING ERRCODE = 'insufficient_privilege';
  END IF;
  SELECT * INTO _p FROM payment_proofs WHERE id = p_proof_id FOR UPDATE;
  IF NOT FOUND OR _p.status <> 'submitted' THEN
    RAISE EXCEPTION 'This receipt was already reviewed.';
  END IF;
  SELECT * INTO _b FROM bookings WHERE id = _p.booking_id FOR UPDATE;

  UPDATE payment_proofs
     SET status = CASE WHEN p_accept THEN 'accepted' ELSE 'rejected' END,
         review_note = p_note, reviewed_by = auth.uid(), reviewed_at = now()
   WHERE id = p_proof_id;

  IF p_accept THEN
    _amount := coalesce(_p.amount_mad, _b.amount_mad, 0);
    UPDATE bookings SET payment_status = 'paid' WHERE id = _b.id;
    INSERT INTO payment_transactions
      (booking_id, patient_id, psychologist_id, transaction_type, status, amount_mad,
       net_to_psychologist_mad, provider, provider_payment_id, paid_at)
    VALUES (_b.id, _b.patient_id, _b.psychologist_id, 'full', 'succeeded', _amount,
            _amount, _p.method, _p.reference, now());
  END IF;

  INSERT INTO notifications (user_id, type, title, body, action_url, metadata)
  VALUES (_p.patient_id,
          CASE WHEN p_accept THEN 'payment_accepted' ELSE 'payment_rejected' END,
          CASE WHEN p_accept THEN 'Payment received' ELSE 'Receipt not accepted' END,
          CASE WHEN p_accept THEN 'Thank you, your session is paid.'
               ELSE 'We could not match your receipt.' || coalesce(' ' || p_note, '')
                    || ' You can upload another one or pay at the session.' END,
          '/dashboard/client', jsonb_build_object('booking_id', _b.id));
END;
$$;
REVOKE ALL ON FUNCTION public.review_payment_proof(uuid, boolean, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_payment_proof(uuid, boolean, text) TO authenticated;
