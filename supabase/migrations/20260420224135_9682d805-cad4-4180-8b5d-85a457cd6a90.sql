
-- 1) Per-psychologist deposit percentage
ALTER TABLE public.psychologist_profiles
  ADD COLUMN IF NOT EXISTS deposit_percentage numeric NOT NULL DEFAULT 50.00
    CHECK (deposit_percentage >= 0 AND deposit_percentage <= 100);

-- 2) Payment transactions
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  psychologist_id uuid NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('deposit','balance','refund','full')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','succeeded','failed','refunded','cancelled')),
  amount_mad numeric NOT NULL,
  commission_mad numeric NOT NULL DEFAULT 0,
  vat_mad numeric NOT NULL DEFAULT 0,
  net_to_psychologist_mad numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'MAD',
  provider text NOT NULL DEFAULT 'mock',
  provider_payment_id text,
  provider_metadata jsonb DEFAULT '{}'::jsonb,
  failure_reason text,
  paid_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_tx_booking ON public.payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_psy ON public.payment_transactions(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_patient ON public.payment_transactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_status ON public.payment_transactions(status);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all transactions" ON public.payment_transactions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Patients view own transactions" ON public.payment_transactions
  FOR SELECT TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Psychologists view own transactions" ON public.payment_transactions
  FOR SELECT TO authenticated
  USING (psychologist_id = auth.uid());

CREATE TRIGGER trg_payment_tx_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Monthly payouts to psychologists (Connect-like mock)
CREATE TABLE IF NOT EXISTS public.payment_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id uuid NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  gross_mad numeric NOT NULL DEFAULT 0,
  commission_mad numeric NOT NULL DEFAULT 0,
  vat_mad numeric NOT NULL DEFAULT 0,
  net_mad numeric NOT NULL DEFAULT 0,
  transaction_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','paid','failed')),
  payout_method text DEFAULT 'bank_transfer',
  payout_reference text,
  paid_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payouts_psy ON public.payment_payouts(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_payouts_period ON public.payment_payouts(period_start, period_end);

ALTER TABLE public.payment_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all payouts" ON public.payment_payouts
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Psychologists view own payouts" ON public.payment_payouts
  FOR SELECT TO authenticated
  USING (psychologist_id = auth.uid());

CREATE TRIGGER trg_payouts_updated_at
  BEFORE UPDATE ON public.payment_payouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
