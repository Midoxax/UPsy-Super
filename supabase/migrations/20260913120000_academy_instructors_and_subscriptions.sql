-- Academy rebuild: instructor-led course presentation + Stripe-backed
-- all-access subscription.
--
-- Peterson-Academy-style course pages are built around a named expert
-- ("professor") per course, plus a paid all-access membership that unlocks
-- every premium course. `all_access_subscriptions` and `has_all_access()`
-- already exist for exactly this entitlement but were never wired to a real
-- payment provider or read from the client — this migration extends that
-- existing table with Stripe fields instead of introducing a second,
-- competing subscriptions table.

-- 1. Instructor identity on courses
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS instructor_name text,
  ADD COLUMN IF NOT EXISTS instructor_title text,
  ADD COLUMN IF NOT EXISTS instructor_bio text,
  ADD COLUMN IF NOT EXISTS instructor_avatar_url text,
  ADD COLUMN IF NOT EXISTS is_academy_premium boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.courses.is_academy_premium IS
  'Gated behind public.has_all_access(), independent of the legacy is_paid/price_mad single-purchase flow.';

-- 2. Which module is free to preview even when the course is premium
ALTER TABLE public.course_modules
  ADD COLUMN IF NOT EXISTS is_free_preview boolean NOT NULL DEFAULT false;

-- 3. Wire all_access_subscriptions to Stripe
ALTER TABLE public.all_access_subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS all_access_subscriptions_stripe_subscription_id_key
  ON public.all_access_subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- Stripe subscription statuses include trialing/incomplete/unpaid, which the
-- original 'active'|'canceled'|'past_due'|'expired' CHECK would reject.
ALTER TABLE public.all_access_subscriptions
  DROP CONSTRAINT IF EXISTS all_access_subscriptions_status_check;
ALTER TABLE public.all_access_subscriptions
  ADD CONSTRAINT all_access_subscriptions_status_check
  CHECK (status IN (
    'active', 'trialing', 'canceled', 'past_due', 'expired',
    'incomplete', 'incomplete_expired', 'unpaid', 'paused'
  ));

ALTER TABLE public.all_access_subscriptions
  ALTER COLUMN amount_mad DROP NOT NULL,
  ALTER COLUMN amount_mad DROP DEFAULT,
  ALTER COLUMN amount_eur DROP NOT NULL,
  ALTER COLUMN amount_eur DROP DEFAULT;

CREATE OR REPLACE FUNCTION public.has_all_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.all_access_subscriptions
    WHERE user_id = _user_id
      AND status IN ('active', 'trialing')
      AND current_period_end > now()
  );
$$;

-- 4. Stripe (via the create-academy-checkout / academy-stripe-webhook edge
-- functions, using the service-role key) is the only writer going forward.
-- The client only ever needs to read its own entitlement.
DROP POLICY IF EXISTS "Users manage own all-access" ON public.all_access_subscriptions;
CREATE POLICY "Users can view own all-access" ON public.all_access_subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
