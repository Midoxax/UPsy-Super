ALTER TABLE public.payment_transactions
  ADD COLUMN IF NOT EXISTS invoice_number text,
  ADD COLUMN IF NOT EXISTS invoice_pdf_url text;

CREATE INDEX IF NOT EXISTS idx_payment_transactions_patient
  ON public.payment_transactions (patient_id, created_at DESC);

-- RLS: ensure patients can read their own transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'payment_transactions'
      AND policyname = 'Patients view own transactions'
  ) THEN
    CREATE POLICY "Patients view own transactions"
      ON public.payment_transactions
      FOR SELECT
      TO authenticated
      USING (auth.uid() = patient_id);
  END IF;
END $$;