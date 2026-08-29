
-- 1. ai_subscriptions
DROP POLICY IF EXISTS "Users manage own ai sub" ON public.ai_subscriptions;
CREATE POLICY "Users view own ai sub"
  ON public.ai_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 2. all_access_subscriptions
DROP POLICY IF EXISTS "Users manage own all-access" ON public.all_access_subscriptions;
CREATE POLICY "Users view own all-access"
  ON public.all_access_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 3. athlete_subscriptions
DROP POLICY IF EXISTS "Users manage own athlete sub" ON public.athlete_subscriptions;
CREATE POLICY "Users view own athlete sub"
  ON public.athlete_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 4. ai_usage_meter — drop client write policies; provide RPC
DROP POLICY IF EXISTS "Users insert own usage" ON public.ai_usage_meter;
DROP POLICY IF EXISTS "Users update own usage" ON public.ai_usage_meter;

CREATE OR REPLACE FUNCTION public.increment_ai_usage()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_count integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  INSERT INTO public.ai_usage_meter (user_id, usage_date, message_count)
  VALUES (v_uid, CURRENT_DATE, 1)
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET message_count = public.ai_usage_meter.message_count + 1
  RETURNING message_count INTO v_count;

  RETURN v_count;
END;
$$;

-- 5. course_enrollments — gate INSERT to free courses or paid purchases
DROP POLICY IF EXISTS "Users can manage own enrollments" ON public.course_enrollments;

CREATE POLICY "Users view own enrollments"
  ON public.course_enrollments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own enrollments"
  ON public.course_enrollments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own enrollments"
  ON public.course_enrollments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users enroll in free or purchased courses"
  ON public.course_enrollments FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = course_id
          AND (COALESCE(c.is_paid, false) = false OR COALESCE(c.price_mad, 0) = 0)
      )
      OR EXISTS (
        SELECT 1 FROM public.course_purchases cp
        WHERE cp.user_id = auth.uid()
          AND cp.course_id = course_enrollments.course_id
          AND cp.payment_status = 'paid'
      )
    )
  );

CREATE POLICY "Admins manage enrollments"
  ON public.course_enrollments FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 6. course_purchases — remove client INSERT
DROP POLICY IF EXISTS "Users create own purchases" ON public.course_purchases;

-- 7. certificate_verifications — remove amount_mad from public verification
ALTER TABLE public.certificate_verifications DROP COLUMN IF EXISTS amount_mad;

-- 8. realtime: extend user-scoped policy to cover support_ticket_messages topic
DROP POLICY IF EXISTS "User-scoped realtime read" ON realtime.messages;
CREATE POLICY "User-scoped realtime read"
  ON realtime.messages FOR SELECT TO authenticated
  USING (
    (
      realtime.topic() LIKE 'notifications:%'
      AND realtime.topic() = 'notifications:' || auth.uid()::text
    )
    OR (
      realtime.topic() LIKE 'support_tickets:%'
      AND realtime.topic() = 'support_tickets:' || auth.uid()::text
    )
    OR (
      realtime.topic() LIKE 'support_ticket_messages:%'
      AND EXISTS (
        SELECT 1 FROM public.support_tickets st
        WHERE st.id::text = split_part(realtime.topic(), ':', 2)
          AND st.user_id = auth.uid()
      )
    )
    OR has_role(auth.uid(), 'admin'::app_role)
  );
