-- 1. Bookings: column-level restrictions ------------------------------------

DROP POLICY IF EXISTS "Patients can update own bookings" ON public.bookings;
CREATE POLICY "Patients can update own bookings"
ON public.bookings FOR UPDATE TO authenticated
USING (auth.uid() = patient_id)
WITH CHECK (
  auth.uid() = patient_id
  AND status = ANY (ARRAY['pending','proposed','confirmed','cancelled'])
);

DROP POLICY IF EXISTS "Psychologists can update own bookings" ON public.bookings;
CREATE POLICY "Psychologists can update own bookings"
ON public.bookings FOR UPDATE TO authenticated
USING (auth.uid() = psychologist_id)
WITH CHECK (
  auth.uid() = psychologist_id
  AND status = ANY (ARRAY['pending','proposed','confirmed','completed','cancelled','no_show'])
);

CREATE OR REPLACE FUNCTION public.bookings_psychologist_update_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins and non-psychologist paths are handled elsewhere.
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  IF auth.uid() IS DISTINCT FROM OLD.psychologist_id THEN
    RETURN NEW;
  END IF;

  IF NEW.patient_id IS DISTINCT FROM OLD.patient_id
     OR NEW.psychologist_id IS DISTINCT FROM OLD.psychologist_id
     OR NEW.amount_mad IS DISTINCT FROM OLD.amount_mad
     OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
     OR NEW.patient_email IS DISTINCT FROM OLD.patient_email
     OR NEW.patient_phone IS DISTINCT FROM OLD.patient_phone
  THEN
    RAISE EXCEPTION 'psychologists_cannot_modify_restricted_booking_fields';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.bookings_psychologist_update_guard() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS bookings_psychologist_update_guard_trg ON public.bookings;
CREATE TRIGGER bookings_psychologist_update_guard_trg
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.bookings_psychologist_update_guard();

-- 2. SECURITY DEFINER helpers: scope to caller ------------------------------

CREATE OR REPLACE FUNCTION public.get_referral_credit_balance(_user_id uuid)
RETURNS numeric LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(SUM(delta_mad), 0)
  FROM public.referral_credits
  WHERE user_id = _user_id
    AND (_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));
$$;

CREATE OR REPLACE FUNCTION public.get_session_credit_balance(_user_id uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(SUM(delta), 0)::int
  FROM public.session_credits_ledger
  WHERE user_id = _user_id
    AND (_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));
$$;

CREATE OR REPLACE FUNCTION public.get_ai_tier(_user_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT tier FROM public.ai_subscriptions
      WHERE user_id = _user_id AND status = 'active'
        AND (current_period_end IS NULL OR current_period_end > now())
        AND (_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
      LIMIT 1),
    'free'
  );
$$;

CREATE OR REPLACE FUNCTION public.has_all_access(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.all_access_subscriptions
    WHERE user_id = _user_id
      AND status = 'active'
      AND current_period_end > now()
      AND (_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  );
$$;

CREATE OR REPLACE FUNCTION public.has_athlete_plus(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.athlete_subscriptions
    WHERE user_id = _user_id
      AND status = 'active'
      AND current_period_end > now()
      AND (_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  );
$$;

CREATE OR REPLACE FUNCTION public.get_specialist_plan(_user_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT to_jsonb(sp.*) - 'created_at' - 'updated_at'
  FROM public.subscriptions s
  JOIN public.specialist_plans sp
    ON sp.id = CASE
      WHEN s.plan_type IN ('free','pro','elite') THEN s.plan_type
      WHEN s.plan_type = 'basic' THEN 'pro'
      WHEN s.plan_type = 'premium' THEN 'elite'
      ELSE 'free' END
  WHERE s.psychologist_id = _user_id
    AND s.status = 'active'
    AND (_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  LIMIT 1;
$$;

-- 3. Admin guard on hero promotion ------------------------------------------

CREATE OR REPLACE FUNCTION public.promote_home_hero_winner(_auto boolean DEFAULT true)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_decision jsonb;
  v_status  text;
  v_winner  text;
BEGIN
  -- Interactive callers must be admins; the scheduled job runs with no auth.uid().
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  IF EXISTS (SELECT 1 FROM public.experiment_winners WHERE experiment_id = 'home_hero_v1') THEN
    RETURN jsonb_build_object('status', 'already_promoted',
      'winner', (SELECT winning_variant FROM public.experiment_winners WHERE experiment_id = 'home_hero_v1'));
  END IF;

  v_decision := public.home_hero_winner();
  v_status := v_decision->>'status';

  IF v_status = 'winner' THEN
    v_winner := v_decision->>'winner';
    INSERT INTO public.experiment_winners
      (experiment_id, winning_variant, traffic_per_arm, control_rate, winner_rate, lift_pct, confidence, promoted_by, auto)
    VALUES ('home_hero_v1', v_winner,
      (v_decision->>'winner_n')::integer,
      (v_decision->>'control_rate')::double precision,
      (v_decision->>'winner_rate')::double precision,
      (v_decision->>'lift_pct')::double precision,
      (v_decision->>'confidence')::double precision,
      auth.uid(), _auto);
    RETURN jsonb_build_object('status', 'promoted', 'winner', v_winner, 'decision', v_decision);
  END IF;

  RETURN v_decision;
END;
$$;

-- 4. Remove anonymous access to user-scoped definer helpers ------------------

REVOKE EXECUTE ON FUNCTION public.get_referral_credit_balance(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_session_credit_balance(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_ai_tier(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_all_access(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_athlete_plus(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_specialist_plan(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_specialist_earnings_summary() FROM anon;
REVOKE EXECUTE ON FUNCTION public.mark_all_notifications_read() FROM anon;
REVOKE EXECUTE ON FUNCTION public.replace_availability_for_day(smallint, jsonb) FROM anon;

-- 5. Internal-only helpers: not reachable from the public API ----------------

REVOKE EXECUTE ON FUNCTION public.crm_pick_owner() FROM anon, authenticated;
