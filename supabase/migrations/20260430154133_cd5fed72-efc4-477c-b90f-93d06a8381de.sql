-- =========================================================
-- MONETIZATION FOUNDATION MIGRATION
-- =========================================================

-- 1. SPECIALIST BOOSTS (pay-as-you-go visibility)
CREATE TABLE public.specialist_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL,
  boost_type TEXT NOT NULL CHECK (boost_type IN ('spotlight','search_boost','highlight')),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  amount_mad NUMERIC NOT NULL DEFAULT 0,
  amount_eur NUMERIC,
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('pending','paid','refunded','failed')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.specialist_boosts ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_boosts_active ON public.specialist_boosts (psychologist_id, ends_at) WHERE payment_status='paid';

CREATE POLICY "Specialists manage own boosts" ON public.specialist_boosts
  FOR ALL TO authenticated USING (auth.uid() = psychologist_id) WITH CHECK (auth.uid() = psychologist_id);
CREATE POLICY "Admins manage all boosts" ON public.specialist_boosts
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Public sees active boost flags" ON public.specialist_boosts
  FOR SELECT TO anon, authenticated USING (payment_status='paid' AND ends_at > now());

-- Add boost flag to psychologist_profiles for fast ranking
ALTER TABLE public.psychologist_profiles
  ADD COLUMN IF NOT EXISTS boosted_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS boost_type TEXT;

-- 2. COURSE PAYWALL & BUNDLES
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS price_mad NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price_eur NUMERIC,
  ADD COLUMN IF NOT EXISTS is_paid BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE public.course_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID,
  bundle_slug TEXT,
  amount_mad NUMERIC NOT NULL,
  amount_eur NUMERIC,
  currency TEXT NOT NULL DEFAULT 'MAD',
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('pending','paid','refunded','failed')),
  coupon_code TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (course_id IS NOT NULL OR bundle_slug IS NOT NULL)
);
ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_course_purchases_user ON public.course_purchases (user_id);

CREATE POLICY "Users view own purchases" ON public.course_purchases
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own purchases" ON public.course_purchases
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage purchases" ON public.course_purchases
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- 3. ALL-ACCESS PASS
CREATE TABLE public.all_access_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','canceled','past_due','expired')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','yearly')),
  amount_mad NUMERIC NOT NULL DEFAULT 199,
  amount_eur NUMERIC NOT NULL DEFAULT 19,
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.all_access_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own all-access" ON public.all_access_subscriptions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all-access" ON public.all_access_subscriptions
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- 4. SESSION CREDIT PACKS
CREATE TABLE public.session_credit_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  session_count INTEGER NOT NULL,
  discount_percent NUMERIC NOT NULL DEFAULT 0,
  price_mad NUMERIC NOT NULL,
  price_eur NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.session_credit_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads active packs" ON public.session_credit_packs
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins manage packs" ON public.session_credit_packs
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TABLE public.session_credits_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  delta INTEGER NOT NULL,         -- +N for purchase, -1 per used session
  reason TEXT NOT NULL,           -- 'purchase' | 'booking_consume' | 'refund' | 'admin_adjust'
  pack_id UUID,
  booking_id UUID,
  amount_mad NUMERIC,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.session_credits_ledger ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_credits_user ON public.session_credits_ledger (user_id);

CREATE POLICY "Users view own credits" ON public.session_credits_ledger
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own credit purchases" ON public.session_credits_ledger
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND reason IN ('purchase'));
CREATE POLICY "Admins manage credits" ON public.session_credits_ledger
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- 5. PREMIUM ASSESSMENT REPORTS
CREATE TABLE public.assessment_premium_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  result_id UUID NOT NULL,
  amount_mad NUMERIC NOT NULL DEFAULT 49,
  amount_eur NUMERIC NOT NULL DEFAULT 4.9,
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('pending','paid','refunded','failed')),
  pdf_url TEXT,
  protocol JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.assessment_premium_reports ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_premium_reports_user ON public.assessment_premium_reports (user_id);

CREATE POLICY "Users view own premium reports" ON public.assessment_premium_reports
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own premium reports" ON public.assessment_premium_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage premium reports" ON public.assessment_premium_reports
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- 6. AI USAGE METER + SUBSCRIPTIONS
CREATE TABLE public.ai_subscriptions (
  user_id UUID PRIMARY KEY,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free','plus','pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','canceled','past_due','expired')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  amount_mad NUMERIC NOT NULL DEFAULT 0,
  amount_eur NUMERIC NOT NULL DEFAULT 0,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai sub" ON public.ai_subscriptions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage ai subs" ON public.ai_subscriptions
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TABLE public.ai_usage_meter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, usage_date)
);
ALTER TABLE public.ai_usage_meter ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own usage" ON public.ai_usage_meter
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own usage" ON public.ai_usage_meter
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own usage" ON public.ai_usage_meter
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read usage" ON public.ai_usage_meter
  FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));

-- 7. CERTIFICATE VERIFICATION
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_url TEXT;

CREATE TABLE public.certificate_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number TEXT NOT NULL UNIQUE,
  certificate_id UUID NOT NULL,
  recipient_name TEXT NOT NULL,
  title TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  amount_mad NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.certificate_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can verify certificates" ON public.certificate_verifications
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage verifications" ON public.certificate_verifications
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- 8. ATHLETE+ SUBSCRIPTION
CREATE TABLE public.athlete_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'plus' CHECK (tier IN ('plus','team')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','canceled','past_due','expired')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  amount_mad NUMERIC NOT NULL DEFAULT 149,
  amount_eur NUMERIC NOT NULL DEFAULT 14.9,
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.athlete_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own athlete sub" ON public.athlete_subscriptions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage athlete subs" ON public.athlete_subscriptions
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- 9. COUPONS
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent','amount')),
  discount_value NUMERIC NOT NULL,
  applies_to TEXT NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all','plans','courses','reports','credits','boosts','athlete')),
  max_redemptions INTEGER,
  redemption_count INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read active coupons" ON public.coupons
  FOR SELECT TO authenticated USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));
CREATE POLICY "Admins manage coupons" ON public.coupons
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

CREATE TABLE public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL,
  user_id UUID NOT NULL,
  redeemed_for TEXT NOT NULL,    -- 'plan'|'course'|'report'|'credits'|'boost'|'athlete'
  reference_id UUID,
  amount_saved_mad NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_redemptions_user ON public.coupon_redemptions (user_id);
CREATE POLICY "Users view own redemptions" ON public.coupon_redemptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own redemptions" ON public.coupon_redemptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage redemptions" ON public.coupon_redemptions
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- 10. REFERRAL CREDITS LEDGER
CREATE TABLE public.referral_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  delta_mad NUMERIC NOT NULL,
  reason TEXT NOT NULL,           -- 'referral_signup'|'referral_first_booking'|'spend'|'admin_adjust'
  referral_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_credits ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_referral_credits_user ON public.referral_credits (user_id);
CREATE POLICY "Users view own credit balance" ON public.referral_credits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage referral credits" ON public.referral_credits
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- 11. ORG SUBSCRIPTION PLAN CATALOG
CREATE TABLE public.org_subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('starter','growth','enterprise')),
  monthly_mad NUMERIC NOT NULL DEFAULT 0,
  monthly_eur NUMERIC,
  yearly_mad NUMERIC,
  yearly_eur NUMERIC,
  max_seats INTEGER,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.org_subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads active org plans" ON public.org_subscription_plans
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins manage org plans" ON public.org_subscription_plans
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- 12. SECTOR REPORTS (B2B data product)
CREATE TABLE public.sector_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  org_id UUID,
  sector TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','canceled','expired')),
  billing_cycle TEXT NOT NULL DEFAULT 'yearly',
  amount_mad NUMERIC NOT NULL DEFAULT 4990,
  amount_eur NUMERIC NOT NULL DEFAULT 499,
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '1 year'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sector_reports ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_sector_reports_user ON public.sector_reports (user_id);
CREATE POLICY "Users view own sector reports" ON public.sector_reports
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own sector reports" ON public.sector_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage sector reports" ON public.sector_reports
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- 13. CURRENCY PREFERENCE on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS currency_preference TEXT NOT NULL DEFAULT 'MAD' CHECK (currency_preference IN ('MAD','EUR'));

-- =========================================================
-- HELPER FUNCTIONS
-- =========================================================

-- Get current session credit balance
CREATE OR REPLACE FUNCTION public.get_session_credit_balance(_user_id UUID)
RETURNS INTEGER
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(SUM(delta), 0)::int
  FROM public.session_credits_ledger
  WHERE user_id = _user_id;
$$;

-- Get current referral credit balance (in MAD)
CREATE OR REPLACE FUNCTION public.get_referral_credit_balance(_user_id UUID)
RETURNS NUMERIC
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(SUM(delta_mad), 0)
  FROM public.referral_credits
  WHERE user_id = _user_id;
$$;

-- Has active all-access pass?
CREATE OR REPLACE FUNCTION public.has_all_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.all_access_subscriptions
    WHERE user_id = _user_id
      AND status = 'active'
      AND current_period_end > now()
  );
$$;

-- Has active athlete sub?
CREATE OR REPLACE FUNCTION public.has_athlete_plus(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.athlete_subscriptions
    WHERE user_id = _user_id
      AND status = 'active'
      AND current_period_end > now()
  );
$$;

-- Get AI tier for user
CREATE OR REPLACE FUNCTION public.get_ai_tier(_user_id UUID)
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT tier FROM public.ai_subscriptions
      WHERE user_id = _user_id AND status='active' AND (current_period_end IS NULL OR current_period_end > now())
      LIMIT 1),
    'free'
  );
$$;

-- Sync boost flag onto psychologist_profiles when a boost is purchased
CREATE OR REPLACE FUNCTION public.sync_psychologist_boost()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.psychologist_profiles
  SET boosted_until = (
        SELECT MAX(ends_at) FROM public.specialist_boosts
        WHERE psychologist_id = NEW.psychologist_id AND payment_status = 'paid' AND ends_at > now()
      ),
      boost_type = NEW.boost_type
  WHERE id = NEW.psychologist_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_boost
AFTER INSERT OR UPDATE ON public.specialist_boosts
FOR EACH ROW EXECUTE FUNCTION public.sync_psychologist_boost();

-- Validate & redeem coupon (returns discounted amount or raises)
CREATE OR REPLACE FUNCTION public.validate_coupon(_code TEXT, _amount_mad NUMERIC, _applies_to TEXT)
RETURNS TABLE(coupon_id UUID, discount_mad NUMERIC, final_mad NUMERIC)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  c RECORD;
  d NUMERIC := 0;
BEGIN
  SELECT * INTO c FROM public.coupons
   WHERE code = upper(_code)
     AND is_active = true
     AND (valid_until IS NULL OR valid_until > now())
     AND (max_redemptions IS NULL OR redemption_count < max_redemptions)
     AND (applies_to = 'all' OR applies_to = _applies_to)
   LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired coupon';
  END IF;

  IF c.discount_type = 'percent' THEN
    d := round(_amount_mad * (c.discount_value/100.0), 2);
  ELSE
    d := LEAST(c.discount_value, _amount_mad);
  END IF;

  RETURN QUERY SELECT c.id, d, GREATEST(_amount_mad - d, 0);
END;
$$;

-- =========================================================
-- SEED DATA
-- =========================================================

-- Org plan catalog
INSERT INTO public.org_subscription_plans (slug,name,tier,monthly_mad,monthly_eur,yearly_mad,yearly_eur,max_seats,features,display_order) VALUES
('org-starter','Starter','starter',2990,299,29900,2990,25,'["Pulse surveys","Content library","5 sessions / month","Email support"]'::jsonb,1),
('org-growth','Growth','growth',7990,799,79900,7990,100,'["Everything in Starter","Analytics dashboard","Dedicated specialist pool","Monthly leadership report","Priority support"]'::jsonb,2),
('org-enterprise','Enterprise','enterprise',0,0,0,0,NULL,'["Everything in Growth","On-site workshops","Crisis line","White-label portal","Dedicated CSM","Custom SLAs"]'::jsonb,3);

-- Session credit packs
INSERT INTO public.session_credit_packs (slug,name,session_count,discount_percent,price_mad,price_eur) VALUES
('pack-4','4 sessions',4,8,1840,184),
('pack-8','8 sessions',8,12,3520,352),
('pack-12','12 sessions',12,15,5100,510);

-- Launch coupons
INSERT INTO public.coupons (code,description,discount_type,discount_value,applies_to,valid_until) VALUES
('WELCOME10','First-time user 10% off','percent',10,'all',now() + INTERVAL '180 days'),
('LAUNCH50','Beta launch 50 MAD off','amount',50,'all',now() + INTERVAL '90 days'),
('YEARLY2','Yearly billing 2 months free (used internally)','percent',16.66,'all',NULL);
