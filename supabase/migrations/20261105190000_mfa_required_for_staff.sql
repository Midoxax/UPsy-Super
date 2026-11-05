-- Specialists and admins must use a second factor (TOTP). The app sends them
-- to /auth/mfa-setup until their session reaches aal2; these restrictive
-- policies make the rule hold for any client of the API, not only the app.
-- Clients, organisations and anonymous visitors are unaffected.
--
-- ISO/IEC 27001 A.8.5 · SOC 2 CC6.1 · OWASP ASVS 2.7 · Law 09-08 art. 23.

CREATE OR REPLACE FUNCTION public.mfa_satisfied()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NULL
      OR coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
      OR NOT EXISTS (
           SELECT 1 FROM public.user_roles
           WHERE user_id = auth.uid() AND role IN ('admin', 'psychologist'));
$$;
GRANT EXECUTE ON FUNCTION public.mfa_satisfied() TO anon, authenticated, service_role;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    -- clinical
    'sessions', 'session_notes', 'bookings', 'client_anamneses',
    'intake_clinical_briefs', 'treatment_plans', 'discharge_summaries',
    'homework_assignments', 'assessment_results', 'assessment_premium_reports',
    'mood_entries', 'journal_entries', 'crisis_alerts', 'documents',
    -- money
    'payments', 'payment_proofs', 'invoices', 'subscriptions',
    -- admin and CRM
    'audit_log', 'app_logs', 'contact_submissions', 'leads', 'growth_leads',
    'crm_contacts', 'crm_deals', 'crm_activities', 'crm_email_messages',
    'crm_organisations', 'proposal_requests', 'psychologist_applications',
    'support_tickets', 'support_ticket_messages', 'client_matching_requests',
    'organization_members', 'legal_acceptances'
  ] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('DROP POLICY IF EXISTS "staff need mfa" ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY "staff need mfa" ON public.%I AS RESTRICTIVE FOR ALL TO authenticated
         USING (public.mfa_satisfied()) WITH CHECK (public.mfa_satisfied())', t);
  END LOOP;
END $$;

-- Profiles: everyone keeps their own row; reading or editing other people's
-- profiles (admins) needs the second factor.
DROP POLICY IF EXISTS "staff need mfa" ON public.profiles;
CREATE POLICY "staff need mfa" ON public.profiles AS RESTRICTIVE FOR ALL TO authenticated
  USING (id = auth.uid() OR public.mfa_satisfied())
  WITH CHECK (id = auth.uid() OR public.mfa_satisfied());
