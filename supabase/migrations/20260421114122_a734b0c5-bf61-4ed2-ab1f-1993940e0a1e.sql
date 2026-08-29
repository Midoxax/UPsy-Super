-- 1. preferred_locale on applications
ALTER TABLE public.psychologist_applications
  ADD COLUMN IF NOT EXISTS preferred_locale text NOT NULL DEFAULT 'fr'
  CHECK (preferred_locale IN ('en', 'fr', 'ar'));

-- 2. provisioning_attempts
CREATE TABLE IF NOT EXISTS public.provisioning_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL,
  admin_user_id uuid,
  user_id uuid,
  status text NOT NULL CHECK (status IN ('success', 'failure', 'partial')),
  reused_existing_user boolean NOT NULL DEFAULT false,
  already_provisioned boolean NOT NULL DEFAULT false,
  error_code text,
  error_message text,
  duration_ms integer,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_provisioning_attempts_app
  ON public.provisioning_attempts (application_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_provisioning_attempts_status
  ON public.provisioning_attempts (status, created_at DESC);

ALTER TABLE public.provisioning_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage provisioning attempts"
  ON public.provisioning_attempts
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. anamnesis_reminders
CREATE TABLE IF NOT EXISTS public.anamnesis_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  booking_id uuid,
  anamnesis_id uuid,
  due_at timestamptz NOT NULL,
  sent_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  channel text NOT NULL DEFAULT 'email',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_anamnesis_reminders_client
  ON public.anamnesis_reminders (client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anamnesis_reminders_due
  ON public.anamnesis_reminders (status, due_at);

ALTER TABLE public.anamnesis_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients view own reminders"
  ON public.anamnesis_reminders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Admins manage all reminders"
  ON public.anamnesis_reminders
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Per-org PDF branding
ALTER TABLE public.organization_accounts
  ADD COLUMN IF NOT EXISTS pdf_logo_url text,
  ADD COLUMN IF NOT EXISTS pdf_primary_color text,
  ADD COLUMN IF NOT EXISTS pdf_signature_label text;

-- 5. inspect_provisioning_state RPC
CREATE OR REPLACE FUNCTION public.inspect_provisioning_state(_application_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app RECORD;
  v_user_id uuid;
  v_user_exists boolean := false;
  v_role_exists boolean := false;
  v_profile_exists boolean := false;
  v_subscription_exists boolean := false;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT * INTO v_app FROM public.psychologist_applications WHERE id = _application_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'application_not_found');
  END IF;

  v_user_id := v_app.user_id;

  IF v_user_id IS NOT NULL THEN
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = v_user_id) INTO v_user_exists;
    SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = v_user_id AND role = 'psychologist') INTO v_role_exists;
    SELECT EXISTS(SELECT 1 FROM public.psychologist_profiles WHERE id = v_user_id) INTO v_profile_exists;
    SELECT EXISTS(SELECT 1 FROM public.subscriptions WHERE psychologist_id = v_user_id) INTO v_subscription_exists;
  END IF;

  RETURN jsonb_build_object(
    'application_id', _application_id,
    'application_status', v_app.status,
    'user_id', v_user_id,
    'email', v_app.email,
    'preferred_locale', v_app.preferred_locale,
    'user_exists', v_user_exists,
    'role_exists', v_role_exists,
    'profile_exists', v_profile_exists,
    'subscription_exists', v_subscription_exists,
    'fully_provisioned', (v_user_exists AND v_role_exists AND v_profile_exists AND v_subscription_exists)
  );
END;
$$;