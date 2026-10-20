-- Lock anamnesis-reminder-cron to its scheduled job, the same way as
-- 20261020160000_reminders_cron_secret.sql: a random Vault secret sent by the
-- cron job and checked by the function through cron_secret_ok().

DO $$
BEGIN
  IF to_regnamespace('vault') IS NULL OR to_regnamespace('cron') IS NULL THEN
    RETURN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'anamnesis_cron_secret') THEN
    PERFORM vault.create_secret(
      replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
      'anamnesis_cron_secret',
      'Bearer token the anamnesis reminder cron job sends to anamnesis-reminder-cron');
  END IF;
  PERFORM cron.schedule(
    'anamnesis-reminder-every-6h',
    '0 */6 * * *',
    $cmd$
    SELECT net.http_post(
      url := 'https://skxxvgjjdshcopybokdt.supabase.co/functions/v1/anamnesis-reminder-cron',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets
                                       WHERE name = 'anamnesis_cron_secret')),
      body := jsonb_build_object('triggered_at', now())
    ) AS request_id;
    $cmd$);
END $$;
