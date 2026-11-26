-- Follow-up email sequences ("nurture"), sent by the nurture-emails function.
--
-- Four sequences, copy in supabase/functions/_shared/nurture/:
--   lsspm       League page leads          → stop once they apply
--   specialist  Join Specialist page leads → stop once they apply
--   free_score  free score / WELCOME20     → stop once they book
--   onboarding  new psychologist accounts  → five emails, skipping steps done
--
-- Leads are enrolled only with marketing consent (Law 09-08). Every email
-- goes through the marketing pipeline: suppression list, unsubscribe link,
-- send log. An unsubscribed address stops its sequence.

CREATE TABLE IF NOT EXISTS public.nurture_enrolments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence text NOT NULL
    CHECK (sequence IN ('lsspm', 'specialist', 'free_score', 'onboarding')),
  email text NOT NULL CHECK (email = lower(email) AND email LIKE '%@%'),
  full_name text,
  lead_id uuid REFERENCES public.growth_leads(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  -- fr, ar, en; ary Darija; zgh Tamazight (Tifinagh); rif Tarifit.
  lang text NOT NULL DEFAULT 'fr'
    CHECK (lang IN ('fr', 'ar', 'en', 'ary', 'zgh', 'rif')),
  -- The next step to send (0-based).
  step integer NOT NULL DEFAULT 0 CHECK (step >= 0),
  next_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'converted', 'completed', 'stopped')),
  sent_count integer NOT NULL DEFAULT 0,
  attempts integer NOT NULL DEFAULT 0,
  last_sent_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sequence, email)
);

CREATE INDEX IF NOT EXISTS nurture_enrolments_due_idx
  ON public.nurture_enrolments (next_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS nurture_enrolments_lead_id_idx
  ON public.nurture_enrolments (lead_id);
CREATE INDEX IF NOT EXISTS nurture_enrolments_user_id_idx
  ON public.nurture_enrolments (user_id);
CREATE INDEX IF NOT EXISTS nurture_enrolments_email_idx
  ON public.nurture_enrolments (email);

ALTER TABLE public.nurture_enrolments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.nurture_enrolments FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.nurture_enrolments TO authenticated;
GRANT ALL ON public.nurture_enrolments TO service_role;

DROP POLICY IF EXISTS "Admins read nurture enrolments" ON public.nurture_enrolments;
CREATE POLICY "Admins read nurture enrolments" ON public.nurture_enrolments
  FOR SELECT TO authenticated
  USING ((SELECT public.has_role((SELECT auth.uid()), 'admin')));

DROP TRIGGER IF EXISTS nurture_enrolments_updated_at ON public.nurture_enrolments;
CREATE TRIGGER nurture_enrolments_updated_at
  BEFORE UPDATE ON public.nurture_enrolments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- The sequence a lead source enrols in, and how long after sign-up the first
-- email goes. The WELCOME20 page promises the code within minutes.
CREATE OR REPLACE FUNCTION public.nurture_sequence_for(_source text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
  SELECT CASE _source
    WHEN 'campaign_lsspm' THEN 'lsspm'
    WHEN 'campaign_specialist_recruitment' THEN 'specialist'
    WHEN 'free_score' THEN 'free_score'
    WHEN 'campaign_b2c_first_session' THEN 'free_score'
  END;
$$;

CREATE OR REPLACE FUNCTION public.nurture_first_delay(_source text)
RETURNS interval LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
  SELECT CASE _source
    WHEN 'campaign_b2c_first_session' THEN interval '5 minutes'
    WHEN 'free_score' THEN interval '1 hour'
    ELSE interval '2 hours'
  END;
$$;

CREATE OR REPLACE FUNCTION public.nurture_lang(_locale text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
  SELECT CASE
    WHEN lower(_locale) IN ('fr', 'ar', 'en', 'ary', 'zgh', 'rif') THEN lower(_locale)
    WHEN lower(left(coalesce(_locale, ''), 2)) IN ('ar', 'en') THEN lower(left(_locale, 2))
    ELSE 'fr'
  END;
$$;

-- Addresses never mailed: reserved test domains.
CREATE OR REPLACE FUNCTION public.nurture_mailable(_email text)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
  SELECT _email LIKE '%@%'
     AND _email NOT LIKE '%.invalid'
     AND _email NOT LIKE '%.test'
     AND _email NOT LIKE '%@example.%';
$$;

-- A new lead with marketing consent joins its sequence.
CREATE OR REPLACE FUNCTION public.nurture_enrol_lead()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  _seq text := public.nurture_sequence_for(NEW.source);
  _email text := lower(btrim(NEW.email));
BEGIN
  IF _seq IS NULL OR NEW.consent_marketing IS NOT TRUE
     OR NOT public.nurture_mailable(_email) THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.nurture_enrolments (sequence, email, full_name, lead_id, lang, next_at)
  VALUES (_seq, _email, NEW.full_name, NEW.id, public.nurture_lang(NEW.locale),
          now() + public.nurture_first_delay(NEW.source))
  ON CONFLICT (sequence, email) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS nurture_enrol_lead ON public.growth_leads;
CREATE TRIGGER nurture_enrol_lead
  AFTER INSERT ON public.growth_leads
  FOR EACH ROW EXECUTE FUNCTION public.nurture_enrol_lead();

-- A new psychologist account starts onboarding, in the language chosen in
-- the application. The psychologist-recruitment sequences end there.
CREATE OR REPLACE FUNCTION public.nurture_enrol_psychologist()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  _email text;
  _lang text;
BEGIN
  SELECT lower(u.email) INTO _email FROM auth.users u WHERE u.id = NEW.id;
  IF _email IS NULL OR NOT public.nurture_mailable(_email) THEN
    RETURN NEW;
  END IF;
  SELECT a.preferred_locale INTO _lang
    FROM public.psychologist_applications a
   WHERE a.user_id = NEW.id OR lower(a.email) = _email
   ORDER BY a.created_at DESC LIMIT 1;

  UPDATE public.nurture_enrolments
     SET status = 'converted'
   WHERE email = _email AND sequence IN ('lsspm', 'specialist') AND status = 'active';

  INSERT INTO public.nurture_enrolments (sequence, email, full_name, user_id, lang, next_at)
  VALUES ('onboarding', _email, NEW.full_name, NEW.id, public.nurture_lang(_lang),
          now() + interval '1 hour')
  ON CONFLICT (sequence, email) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS nurture_enrol_psychologist ON public.psychologist_profiles;
CREATE TRIGGER nurture_enrol_psychologist
  AFTER INSERT ON public.psychologist_profiles
  FOR EACH ROW EXECUTE FUNCTION public.nurture_enrol_psychologist();

REVOKE ALL ON FUNCTION public.nurture_enrol_lead(), public.nurture_enrol_psychologist()
  FROM PUBLIC, anon, authenticated;

-- What the sender needs, for the emails due now: who, which step, and what
-- each person has already done (applied, booked, profile pieces).
CREATE OR REPLACE FUNCTION public.nurture_due(p_limit integer DEFAULT 50)
RETURNS TABLE (
  id uuid, sequence text, email text, full_name text, lang text,
  step integer, attempts integer, sent_count integer, flags jsonb
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT e.id, e.sequence, e.email, e.full_name, e.lang, e.step, e.attempts, e.sent_count,
    jsonb_build_object(
      'applied',
        EXISTS (SELECT 1 FROM public.psychologist_applications a
                 WHERE lower(a.email) = e.email AND a.submitted_at IS NOT NULL)
        OR EXISTS (SELECT 1 FROM public.psychologist_profiles pp
                     JOIN auth.users u ON u.id = pp.id
                    WHERE lower(u.email) = e.email),
      'booked',
        EXISTS (SELECT 1 FROM public.bookings b
                 WHERE lower(b.patient_email) = e.email
                   AND b.status IS DISTINCT FROM 'cancelled')
        OR EXISTS (SELECT 1 FROM public.bookings b
                     JOIN auth.users u ON u.id = b.patient_id
                    WHERE lower(u.email) = e.email
                      AND b.status IS DISTINCT FROM 'cancelled'),
      'photo', p.photo_url IS NOT NULL,
      'bio', length(coalesce(p.bio, '')) >= 200,
      'rate', p.hourly_rate_mad IS NOT NULL,
      'slots', EXISTS (SELECT 1 FROM public.availability_slots s
                        WHERE s.psychologist_id = e.user_id
                          AND s.is_available AND coalesce(s.is_active, true)),
      'published', coalesce(p.is_published, false)
    )
  FROM public.nurture_enrolments e
  LEFT JOIN public.psychologist_profiles p ON p.id = e.user_id
  WHERE e.status = 'active' AND e.next_at <= now()
  ORDER BY e.next_at
  LIMIT least(greatest(coalesce(p_limit, 50), 1), 200);
$$;

REVOKE ALL ON FUNCTION public.nurture_due(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.nurture_due(integer) TO service_role;

-- Leads of the last 60 days who consented, so they are not left out.
INSERT INTO public.nurture_enrolments (sequence, email, full_name, lead_id, lang, next_at)
SELECT DISTINCT ON (public.nurture_sequence_for(g.source), lower(btrim(g.email)))
       public.nurture_sequence_for(g.source), lower(btrim(g.email)), g.full_name, g.id,
       public.nurture_lang(g.locale), now() + interval '2 hours'
  FROM public.growth_leads g
 WHERE public.nurture_sequence_for(g.source) IS NOT NULL
   AND g.consent_marketing IS TRUE
   AND g.created_at > now() - interval '60 days'
   AND public.nurture_mailable(lower(btrim(g.email)))
 ORDER BY public.nurture_sequence_for(g.source), lower(btrim(g.email)), g.created_at DESC
ON CONFLICT (sequence, email) DO NOTHING;

-- The sender: pg_cron calls nurture-emails every 15 minutes, only when an
-- email is due, with a Vault secret the function checks with cron_secret_ok().
DO $$
BEGIN
  IF to_regnamespace('vault') IS NULL OR to_regnamespace('cron') IS NULL THEN
    RETURN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'nurture_emails_cron_secret') THEN
    PERFORM vault.create_secret(
      replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
      'nurture_emails_cron_secret',
      'Bearer token the nurture-emails cron job sends to nurture-emails');
  END IF;
  PERFORM cron.schedule(
    'nurture-emails',
    '7,22,37,52 * * * *',
    $cmd$
    SELECT net.http_post(
      url := 'https://skxxvgjjdshcopybokdt.supabase.co/functions/v1/nurture-emails',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets
                                       WHERE name = 'nurture_emails_cron_secret')),
      body := '{}'::jsonb
    ) AS request_id
    WHERE EXISTS (SELECT 1 FROM public.nurture_enrolments
                   WHERE status = 'active' AND next_at <= now());
    $cmd$);
END $$;
