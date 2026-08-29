
-- 1. Bookings: hide patient PII columns from all API roles
REVOKE SELECT (patient_email, patient_phone) ON public.bookings FROM authenticated, anon;

-- 2. Certificate verifications: hide recipient_name from public
REVOKE SELECT (recipient_name) ON public.certificate_verifications FROM anon, authenticated;

-- 3. Leads: hide client contact PII from psychologists (admins/service_role retain access)
REVOKE SELECT (client_email, client_phone) ON public.leads FROM authenticated, anon;

-- 4. OPS workspaces: restrict creation to admins
DROP POLICY IF EXISTS "users can create workspaces" ON public.ops_workspaces;
CREATE POLICY "admins can create workspaces"
  ON public.ops_workspaces
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) AND created_by = auth.uid());

-- 5. org_pulse_responses: enforce unique submission tokens
CREATE UNIQUE INDEX IF NOT EXISTS org_pulse_responses_submission_token_key
  ON public.org_pulse_responses (submission_token);

-- 6. user_daily_challenges: remove direct write access; force via RPC
DROP POLICY IF EXISTS "Users manage own daily challenges" ON public.user_daily_challenges;
CREATE POLICY "Users read own daily challenges"
  ON public.user_daily_challenges
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.start_daily_challenge(p_challenge_id uuid)
RETURNS public.user_daily_challenges
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.user_daily_challenges%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.daily_challenges WHERE id = p_challenge_id) THEN
    RAISE EXCEPTION 'invalid_challenge';
  END IF;

  INSERT INTO public.user_daily_challenges (user_id, challenge_id, assigned_for_date)
  VALUES (v_uid, p_challenge_id, CURRENT_DATE)
  ON CONFLICT DO NOTHING
  RETURNING * INTO v_row;

  IF v_row.id IS NULL THEN
    SELECT * INTO v_row FROM public.user_daily_challenges
     WHERE user_id = v_uid AND challenge_id = p_challenge_id AND assigned_for_date = CURRENT_DATE
     LIMIT 1;
  END IF;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.start_daily_challenge(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_daily_challenge(uuid) TO authenticated;
