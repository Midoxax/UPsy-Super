-- ============================================================
-- Specialist payouts + unified notifications
-- ============================================================

-- 1) Specialist payouts table -------------------------------
CREATE TABLE public.specialist_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id uuid NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  gross_mad numeric NOT NULL DEFAULT 0,
  platform_fee_mad numeric NOT NULL DEFAULT 0,
  net_mad numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','paid','failed')),
  paid_at timestamptz,
  payout_method text,
  reference text,
  transaction_ids uuid[] DEFAULT '{}'::uuid[],
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payouts_psychologist ON public.specialist_payouts(psychologist_id, created_at DESC);
CREATE INDEX idx_payouts_status ON public.specialist_payouts(status);

ALTER TABLE public.specialist_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Specialists view own payouts"
  ON public.specialist_payouts FOR SELECT TO authenticated
  USING (auth.uid() = psychologist_id);

CREATE POLICY "Admins manage all payouts"
  ON public.specialist_payouts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_payouts_updated_at
  BEFORE UPDATE ON public.specialist_payouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Earnings summary RPC (for specialist) ------------------
CREATE OR REPLACE FUNCTION public.get_specialist_earnings_summary()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_settled numeric := 0;       -- succeeded, not yet paid out
  v_paid_out numeric := 0;      -- in a paid payout row
  v_pending numeric := 0;       -- awaiting client payment
  v_lifetime_gross numeric := 0;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Lifetime gross from succeeded transactions
  SELECT COALESCE(SUM(net_to_psychologist_mad), 0)
    INTO v_lifetime_gross
  FROM payment_transactions
  WHERE psychologist_id = v_uid
    AND status = 'succeeded';

  -- Paid out: sum of payouts marked paid
  SELECT COALESCE(SUM(net_mad), 0)
    INTO v_paid_out
  FROM specialist_payouts
  WHERE psychologist_id = v_uid
    AND status = 'paid';

  -- Settled = lifetime - paid_out
  v_settled := GREATEST(v_lifetime_gross - v_paid_out, 0);

  -- Pending = completed bookings without succeeded payment
  SELECT COALESCE(SUM(b.amount_mad), 0)
    INTO v_pending
  FROM bookings b
  WHERE b.psychologist_id = v_uid
    AND b.status = 'completed'
    AND NOT EXISTS (
      SELECT 1 FROM payment_transactions pt
      WHERE pt.booking_id = b.id AND pt.status = 'succeeded'
    );

  RETURN jsonb_build_object(
    'available_to_withdraw', ROUND(v_settled, 2),
    'pending_settlement', ROUND(v_pending, 2),
    'paid_out_lifetime', ROUND(v_paid_out, 2),
    'lifetime_net', ROUND(v_lifetime_gross, 2)
  );
END;
$$;

-- 3) Notifications table ------------------------------------
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  action_url text,
  read_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread
  ON public.notifications(user_id, created_at DESC)
  WHERE read_at IS NULL;

CREATE INDEX idx_notifications_user_all
  ON public.notifications(user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage all notifications"
  ON public.notifications FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- 4) Notification preferences -------------------------------
CREATE TABLE public.notification_preferences (
  user_id uuid PRIMARY KEY,
  email_payments boolean NOT NULL DEFAULT true,
  email_bookings boolean NOT NULL DEFAULT true,
  email_reminders boolean NOT NULL DEFAULT true,
  email_gamification boolean NOT NULL DEFAULT false,
  inapp_all boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preferences"
  ON public.notification_preferences FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_notif_prefs_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Mark all read RPC --------------------------------------
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  UPDATE public.notifications
  SET read_at = now()
  WHERE user_id = auth.uid() AND read_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;