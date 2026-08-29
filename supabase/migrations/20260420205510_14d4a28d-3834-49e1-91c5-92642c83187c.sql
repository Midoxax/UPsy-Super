-- ============================================================
-- Phase A — Platform pricing config (admin-controlled)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.platform_pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 20.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  deposit_percentage NUMERIC(5,2) NOT NULL DEFAULT 50.00 CHECK (deposit_percentage >= 0 AND deposit_percentage <= 100),
  vat_rate NUMERIC(5,2) NOT NULL DEFAULT 20.00 CHECK (vat_rate >= 0 AND vat_rate <= 100),
  min_session_price_mad NUMERIC(10,2) NOT NULL DEFAULT 200.00 CHECK (min_session_price_mad >= 0),
  max_session_price_mad NUMERIC(10,2) NOT NULL DEFAULT 2000.00 CHECK (max_session_price_mad >= 0),
  currency TEXT NOT NULL DEFAULT 'MAD',
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID,
  CONSTRAINT price_range_valid CHECK (max_session_price_mad >= min_session_price_mad)
);

-- Only one active config at a time
CREATE UNIQUE INDEX IF NOT EXISTS platform_pricing_config_one_active
  ON public.platform_pricing_config (is_active) WHERE is_active = true;

ALTER TABLE public.platform_pricing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active pricing config"
  ON public.platform_pricing_config FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage pricing config"
  ON public.platform_pricing_config FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- History table for audit
CREATE TABLE IF NOT EXISTS public.platform_pricing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL,
  deposit_percentage NUMERIC(5,2) NOT NULL,
  vat_rate NUMERIC(5,2) NOT NULL,
  min_session_price_mad NUMERIC(10,2) NOT NULL,
  max_session_price_mad NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL,
  change_reason TEXT,
  changed_by UUID,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_pricing_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read pricing history"
  ON public.platform_pricing_history FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Updated_at trigger
CREATE TRIGGER platform_pricing_config_updated_at
  BEFORE UPDATE ON public.platform_pricing_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- History trigger
CREATE OR REPLACE FUNCTION public.log_pricing_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.platform_pricing_history (
    config_id, commission_rate, deposit_percentage, vat_rate,
    min_session_price_mad, max_session_price_mad, currency,
    change_reason, changed_by
  ) VALUES (
    NEW.id, NEW.commission_rate, NEW.deposit_percentage, NEW.vat_rate,
    NEW.min_session_price_mad, NEW.max_session_price_mad, NEW.currency,
    NEW.notes, COALESCE(NEW.updated_by, auth.uid())
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER platform_pricing_log_insert
  AFTER INSERT ON public.platform_pricing_config
  FOR EACH ROW EXECUTE FUNCTION public.log_pricing_change();

CREATE TRIGGER platform_pricing_log_update
  AFTER UPDATE ON public.platform_pricing_config
  FOR EACH ROW
  WHEN (
    OLD.commission_rate IS DISTINCT FROM NEW.commission_rate
    OR OLD.deposit_percentage IS DISTINCT FROM NEW.deposit_percentage
    OR OLD.vat_rate IS DISTINCT FROM NEW.vat_rate
    OR OLD.min_session_price_mad IS DISTINCT FROM NEW.min_session_price_mad
    OR OLD.max_session_price_mad IS DISTINCT FROM NEW.max_session_price_mad
  )
  EXECUTE FUNCTION public.log_pricing_change();

-- Seed default config
INSERT INTO public.platform_pricing_config (commission_rate, deposit_percentage, vat_rate, min_session_price_mad, max_session_price_mad, currency, notes)
VALUES (20.00, 50.00, 20.00, 200.00, 2000.00, 'MAD', 'Configuration initiale')
ON CONFLICT DO NOTHING;