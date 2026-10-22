-- Content automation: monthly newsletter digest of new blog posts, blog
-- posts pushed to LinkedIn / Facebook / Instagram, and a run log so the
-- admin dashboard can show what every automation did and when.
--
-- The blog lives in the code; the build publishes /blog-feed.json, which the
-- content-automation function reads hourly (scheduled at the end).

-- Settings (singleton) -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.automation_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  newsletter_enabled boolean NOT NULL DEFAULT true,
  -- Days between the draft (and the admins' preview email) and the send.
  newsletter_review_days smallint NOT NULL DEFAULT 5 CHECK (newsletter_review_days BETWEEN 0 AND 20),
  social_auto_publish boolean NOT NULL DEFAULT true,
  social_networks text[] NOT NULL DEFAULT ARRAY['linkedin','facebook','instagram']::text[]
    CHECK (social_networks <@ ARRAY['linkedin','facebook','instagram']::text[]),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.automation_settings (id) VALUES (true) ON CONFLICT DO NOTHING;

-- Run log --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.automation_runs (
  id bigserial PRIMARY KEY,
  job text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  ok boolean,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_automation_runs_job ON public.automation_runs (job, started_at DESC);

-- Newsletter -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL CHECK (email = lower(email) AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  locale text NOT NULL DEFAULT 'fr' CHECK (locale IN ('en','fr','ar')),
  source text,
  -- pending until the address is confirmed (double opt-in); rows carried
  -- over from existing marketing consents start as subscribed.
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','subscribed','unsubscribed')),
  confirm_token text UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  confirmation_sent_at timestamptz,
  consent_evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS public.newsletter_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period text NOT NULL UNIQUE CHECK (period ~ '^\d{4}-\d{2}$'),
  status text NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','sending','sent','cancelled','skipped')),
  scheduled_for timestamptz NOT NULL,
  intro_en text,
  intro_fr text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  recipients int NOT NULL DEFAULT 0,
  sent int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  error text
);

CREATE TABLE IF NOT EXISTS public.newsletter_deliveries (
  issue_id uuid NOT NULL REFERENCES public.newsletter_issues(id) ON DELETE CASCADE,
  email text NOT NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (issue_id, email)
);

-- Social posting ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  network text NOT NULL CHECK (network IN ('linkedin','facebook','instagram')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','published','failed','skipped','needs_setup')),
  caption text NOT NULL,
  link text NOT NULL,
  image_url text,
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  external_id text,
  error text,
  attempts smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slug, network)
);

-- Admin-only access to all of the above ----------------------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['automation_settings','automation_runs','newsletter_subscribers',
                           'newsletter_issues','newsletter_deliveries','social_posts'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "admins manage %s" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "admins manage %s" ON public.%I FOR ALL TO authenticated
                    USING (public.has_role(auth.uid(), ''admin''::app_role))
                    WITH CHECK (public.has_role(auth.uid(), ''admin''::app_role))', t, t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
END $$;
GRANT USAGE ON SEQUENCE public.automation_runs_id_seq TO service_role;

-- Public sign-up and confirmation (double opt-in) ------------------------------
-- Returns nothing about the address, so it cannot be used to probe the list.
CREATE OR REPLACE FUNCTION public.newsletter_subscribe(p_email text, p_locale text DEFAULT 'fr', p_source text DEFAULT 'site')
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _email text := lower(trim(p_email));
BEGIN
  IF _email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR length(_email) > 254 THEN
    RAISE EXCEPTION 'invalid email' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.newsletter_subscribers (email, locale, source, consent_evidence)
  VALUES (_email,
          CASE WHEN p_locale IN ('en','fr','ar') THEN p_locale ELSE 'fr' END,
          left(coalesce(p_source, 'site'), 40),
          jsonb_build_object('form', left(coalesce(p_source, 'site'), 40), 'at', now()))
  ON CONFLICT (email) DO UPDATE
    SET status = CASE WHEN newsletter_subscribers.status = 'subscribed' THEN 'subscribed' ELSE 'pending' END,
        locale = EXCLUDED.locale,
        unsubscribed_at = NULL;
END $$;
REVOKE ALL ON FUNCTION public.newsletter_subscribe(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.newsletter_subscribe(text, text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.newsletter_confirm(p_token text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _n int;
BEGIN
  UPDATE public.newsletter_subscribers
  SET status = 'subscribed', confirmed_at = now(),
      consent_evidence = consent_evidence || jsonb_build_object('confirmed_at', now())
  WHERE confirm_token = p_token AND status <> 'unsubscribed';
  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN _n > 0;
END $$;
REVOKE ALL ON FUNCTION public.newsletter_confirm(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.newsletter_confirm(text) TO anon, authenticated;

-- Nothing lost: people who already gave marketing consent on a lead form
-- become subscribers, with that consent as evidence.
INSERT INTO public.newsletter_subscribers (email, locale, source, status, confirmed_at, consent_evidence)
SELECT DISTINCT ON (lower(g.email))
  lower(g.email),
  CASE WHEN g.locale IN ('en','fr','ar') THEN g.locale ELSE 'fr' END,
  coalesce(g.source, 'growth_leads'),
  'subscribed',
  g.created_at,
  jsonb_build_object('carried_from', 'growth_leads', 'lead_id', g.id, 'consented_at', g.created_at)
FROM public.growth_leads g
WHERE g.consent_marketing
  AND lower(g.email) ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND NOT EXISTS (SELECT 1 FROM public.suppressed_emails s WHERE s.email = lower(g.email))
ORDER BY lower(g.email), g.created_at DESC
ON CONFLICT (email) DO NOTHING;

-- Admin monitoring: every pg_cron job with its last run ------------------------
CREATE OR REPLACE FUNCTION public.admin_cron_status()
RETURNS TABLE (jobname text, schedule text, active boolean, last_start timestamptz,
               last_status text, last_message text, failures_24h bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'admins only' USING ERRCODE = '42501';
  END IF;
  IF to_regclass('cron.job_run_details') IS NULL THEN RETURN; END IF;
  RETURN QUERY EXECUTE $q$
    SELECT j.jobname::text, j.schedule::text, j.active,
           r.start_time, r.status::text, left(r.return_message, 300),
           (SELECT count(*) FROM cron.job_run_details d
             WHERE d.jobid = j.jobid AND d.status = 'failed'
               AND d.start_time > now() - interval '24 hours')
    FROM cron.job j
    LEFT JOIN LATERAL (SELECT * FROM cron.job_run_details d WHERE d.jobid = j.jobid
                       ORDER BY d.start_time DESC LIMIT 1) r ON true
    ORDER BY j.jobname $q$;
END $$;
REVOKE ALL ON FUNCTION public.admin_cron_status() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_cron_status() TO authenticated;

-- Email delivery health for the admin dashboard (last 7 days).
CREATE OR REPLACE FUNCTION public.admin_email_health()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'admins only' USING ERRCODE = '42501';
  END IF;
  RETURN jsonb_build_object(
    'by_status', (SELECT coalesce(jsonb_object_agg(status, n), '{}'::jsonb) FROM (
        SELECT status, count(*) n FROM public.email_send_log
        WHERE created_at > now() - interval '7 days' GROUP BY status) s),
    'recent_failures', (SELECT coalesce(jsonb_agg(f ORDER BY f.created_at DESC), '[]'::jsonb) FROM (
        SELECT created_at, template_name, recipient_email, status, left(error_message, 200) AS error_message
        FROM public.email_send_log WHERE status IN ('failed','dlq','bounced')
          AND created_at > now() - interval '7 days'
        ORDER BY created_at DESC LIMIT 20) f),
    'suppressed', (SELECT count(*) FROM public.suppressed_emails)
  );
END $$;
REVOKE ALL ON FUNCTION public.admin_email_health() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_email_health() TO authenticated;

-- Hourly run of content-automation, locked to a Vault secret like the other
-- cron functions (see 20261020160000_reminders_cron_secret.sql).
DO $$
BEGIN
  IF to_regnamespace('vault') IS NULL OR to_regnamespace('cron') IS NULL THEN
    RETURN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'content_automation_cron_secret') THEN
    PERFORM vault.create_secret(
      replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
      'content_automation_cron_secret',
      'Bearer token the content-automation cron job sends to content-automation');
  END IF;
  PERFORM cron.schedule(
    'content-automation-hourly',
    '23 * * * *',
    $cmd$
    SELECT net.http_post(
      url := 'https://skxxvgjjdshcopybokdt.supabase.co/functions/v1/content-automation',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets
                                       WHERE name = 'content_automation_cron_secret')),
      body := jsonb_build_object('triggered_at', now())
    ) AS request_id;
    $cmd$);
END $$;
