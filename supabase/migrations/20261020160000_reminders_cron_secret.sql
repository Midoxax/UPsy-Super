-- Lock the session-reminders-cron function to its scheduled job.
--
-- The function answered anyone who called its public URL. It now requires a
-- bearer token that only the database knows: a random secret kept in Vault,
-- sent by the cron job and checked by the function through
-- cron_secret_ok() (service role only). The value never leaves Postgres.

CREATE OR REPLACE FUNCTION public.cron_secret_ok(p_name text, p_token text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- plpgsql, so the body is not checked against vault at creation time.
  RETURN coalesce(p_token <> '' AND EXISTS (
    SELECT 1 FROM vault.decrypted_secrets s
    WHERE s.name = p_name AND s.decrypted_secret = p_token
  ), false);
END;
$$;
REVOKE ALL ON FUNCTION public.cron_secret_ok(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cron_secret_ok(text, text) TO service_role;

-- Vault and pg_cron exist on Supabase, not in every local test database.
DO $$
BEGIN
  IF to_regnamespace('vault') IS NULL OR to_regnamespace('cron') IS NULL THEN
    RETURN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'reminders_cron_secret') THEN
    PERFORM vault.create_secret(
      replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
      'reminders_cron_secret',
      'Bearer token the reminders cron job sends to session-reminders-cron');
  END IF;
  -- Same job name: cron.schedule replaces the existing job's command.
  PERFORM cron.schedule(
    'session-reminders-cron-every-10min',
    '*/10 * * * *',
    $cmd$
    SELECT net.http_post(
      url := 'https://skxxvgjjdshcopybokdt.supabase.co/functions/v1/session-reminders-cron',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets
                                       WHERE name = 'reminders_cron_secret')),
      body := jsonb_build_object('triggered_at', now())
    ) AS request_id;
    $cmd$);
END $$;
