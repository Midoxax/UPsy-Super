-- Behaviour test for 20261021100000_transfer_payments.sql.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO authenticated;

INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-00000000c0a1', 'client@pay.test'),
  ('00000000-0000-0000-0000-00000000c0a2', 'other@pay.test'),
  ('00000000-0000-0000-0000-00000000c0a3', 'admin@pay.test'),
  ('00000000-0000-0000-0000-00000000c0a4', 'psy@pay.test');
INSERT INTO public.user_roles (user_id, role) VALUES ('00000000-0000-0000-0000-00000000c0a3', 'admin');
INSERT INTO public.psychologist_profiles (id, full_name, slug, hourly_rate_mad)
  VALUES ('00000000-0000-0000-0000-00000000c0a4', 'Psy', 'psy-pay-test', 400);
SET LOCAL session_replication_role = replica;  -- seed a booking without the slot guard
INSERT INTO public.bookings (id, psychologist_id, patient_id, scheduled_at, duration_minutes, status, amount_mad, payment_status)
  VALUES ('00000000-0000-0000-0000-00000000c0b1', '00000000-0000-0000-0000-00000000c0a4',
          '00000000-0000-0000-0000-00000000c0a1', now() + interval '3 days', 50, 'confirmed', 400, 'unpaid');
SET LOCAL session_replication_role = origin;

-- The client submits a receipt for their own booking.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000c0a1', true);
SET LOCAL ROLE authenticated;
INSERT INTO public.payment_proofs (booking_id, method, reference, amount_mad, file_path)
  VALUES ('00000000-0000-0000-0000-00000000c0b1', 'bank_transfer', 'VIR123', 400,
          '00000000-0000-0000-0000-00000000c0a1/payments/00000000-0000-0000-0000-00000000c0b1/r.pdf');
SELECT pg_temp.expect((SELECT count(*) FROM public.payment_proofs) = 1, 'client submits a receipt');
DO $$ BEGIN
  INSERT INTO public.payment_proofs (booking_id, method, file_path)
    VALUES ('00000000-0000-0000-0000-00000000c0b1', 'cashplus',
            '00000000-0000-0000-0000-00000000c0a1/payments/00000000-0000-0000-0000-00000000c0b1/2.pdf');
  RAISE EXCEPTION 'FAILED: second open receipt accepted';
EXCEPTION WHEN unique_violation THEN RAISE NOTICE 'ok: one open receipt per booking'; END $$;
DO $$ BEGIN
  PERFORM public.review_payment_proof((SELECT id FROM public.payment_proofs LIMIT 1), true);
  RAISE EXCEPTION 'FAILED: client reviewed own receipt';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: clients cannot review'; END $$;
RESET ROLE;

-- Someone else cannot submit for that booking.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000c0a2', true);
SET LOCAL ROLE authenticated;
DO $$ BEGIN
  INSERT INTO public.payment_proofs (booking_id, method, file_path)
    VALUES ('00000000-0000-0000-0000-00000000c0b1', 'bank_transfer',
            '00000000-0000-0000-0000-00000000c0a2/payments/00000000-0000-0000-0000-00000000c0b1/x.pdf');
  RAISE EXCEPTION 'FAILED: stranger submitted a receipt';
EXCEPTION WHEN insufficient_privilege THEN RAISE NOTICE 'ok: only the booking''s client submits'; END $$;
SELECT pg_temp.expect((SELECT count(*) FROM public.payment_proofs) = 0, 'strangers cannot read receipts');
RESET ROLE;

SELECT pg_temp.expect(EXISTS (SELECT 1 FROM public.notifications
  WHERE user_id = '00000000-0000-0000-0000-00000000c0a3' AND type = 'payment_receipt'), 'admins are notified');

-- The admin accepts it.
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000c0a3', true);
SET LOCAL ROLE authenticated;
SELECT public.review_payment_proof((SELECT id FROM public.payment_proofs LIMIT 1), true);
RESET ROLE;
SELECT pg_temp.expect((SELECT payment_status FROM public.bookings WHERE id = '00000000-0000-0000-0000-00000000c0b1') = 'paid',
  'accepting marks the booking paid');
SELECT pg_temp.expect((SELECT amount_mad = 400 AND status = 'succeeded' AND provider = 'bank_transfer'
  FROM public.payment_transactions WHERE booking_id = '00000000-0000-0000-0000-00000000c0b1'),
  'accepting records the transaction');
SELECT pg_temp.expect(EXISTS (SELECT 1 FROM public.notifications
  WHERE user_id = '00000000-0000-0000-0000-00000000c0a1' AND type = 'payment_accepted'), 'client is told');

ROLLBACK;
