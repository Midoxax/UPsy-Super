
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, r.role
FROM auth.users u
CROSS JOIN (VALUES ('psychologist'::app_role), ('organization'::app_role)) AS r(role)
WHERE u.email = 'mehdifelji@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.psychologist_profiles (id, full_name, slug, bio, is_published, offers_online, offers_in_person, hourly_rate_mad)
SELECT u.id,
       COALESCE((SELECT full_name FROM public.profiles WHERE id = u.id), 'Mehdi Felji'),
       'mehdi-felji-' || substring(u.id::text, 1, 8),
       'Founder & Performance Psychologist',
       false, true, true, 600
FROM auth.users u
WHERE u.email = 'mehdifelji@gmail.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.organization_accounts (owner_id, name, contact_email, plan_type, seats_total, subscription_status)
SELECT u.id, 'U.Psy HQ', u.email, 'starter', 25, 'active'
FROM auth.users u
WHERE u.email = 'mehdifelji@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM public.organization_accounts WHERE owner_id = u.id);

CREATE TABLE IF NOT EXISTS public.client_anamneses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  psychologist_id uuid,
  booking_id uuid,
  identity jsonb NOT NULL DEFAULT '{}'::jsonb,
  presenting_complaint jsonb NOT NULL DEFAULT '{}'::jsonb,
  history_personal jsonb NOT NULL DEFAULT '{}'::jsonb,
  history_family jsonb NOT NULL DEFAULT '{}'::jsonb,
  medical jsonb NOT NULL DEFAULT '{}'::jsonb,
  lifestyle jsonb NOT NULL DEFAULT '{}'::jsonb,
  risk_screening jsonb NOT NULL DEFAULT '{}'::jsonb,
  goals jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_progress','completed','reviewed')),
  consent_given boolean NOT NULL DEFAULT false,
  consent_at timestamptz,
  completed_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_anamneses_client ON public.client_anamneses(client_id);
CREATE INDEX IF NOT EXISTS idx_client_anamneses_psy ON public.client_anamneses(psychologist_id);

ALTER TABLE public.client_anamneses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients manage own anamnesis"
  ON public.client_anamneses FOR ALL
  TO authenticated
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Psychologists access client anamneses"
  ON public.client_anamneses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.psychologist_id = auth.uid()
        AND b.patient_id = client_anamneses.client_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.psychologist_id = auth.uid()
        AND b.patient_id = client_anamneses.client_id
    )
  );

CREATE POLICY "Admins full access anamneses"
  ON public.client_anamneses FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_client_anamneses_updated_at
  BEFORE UPDATE ON public.client_anamneses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_client_anamneses_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.client_anamneses
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_change();
