-- Phase 6: leads (lead magnet) + referrals tables

CREATE TABLE IF NOT EXISTS public.growth_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text,
  phone text,
  source text NOT NULL DEFAULT 'free_score',
  score_total int,
  score_breakdown jsonb DEFAULT '{}'::jsonb,
  locale text DEFAULT 'fr',
  ip_hash text,
  user_agent text,
  consent_marketing boolean NOT NULL DEFAULT false,
  nurture_stage text DEFAULT 'd0',
  converted_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_growth_leads_email ON public.growth_leads(email);
CREATE INDEX IF NOT EXISTS idx_growth_leads_created ON public.growth_leads(created_at DESC);

ALTER TABLE public.growth_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit growth leads"
  ON public.growth_leads FOR INSERT TO anon, authenticated
  WITH CHECK (nurture_stage = 'd0' AND converted_user_id IS NULL);

CREATE POLICY "Admins read growth leads"
  ON public.growth_leads FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update growth leads"
  ON public.growth_leads FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_growth_leads_updated_at
  BEFORE UPDATE ON public.growth_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referee_email text,
  referee_user_id uuid,
  code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  reward_granted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(code);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own referrals"
  ON public.referrals FOR ALL TO authenticated
  USING (auth.uid() = referrer_id)
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Admins read all referrals"
  ON public.referrals FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can resolve a code (read-only by code) for /invite/:code prefill
CREATE POLICY "Public can resolve referral code"
  ON public.referrals FOR SELECT TO anon, authenticated
  USING (true);

CREATE TRIGGER trg_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper to generate a short code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text LANGUAGE sql VOLATILE AS $$
  SELECT upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8))
$$;