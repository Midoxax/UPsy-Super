-- The ops-task-watcher cron job sent no Authorization header, so the function
-- (deployed with JWT verification on, and expecting an unset CRON_SECRET)
-- answered 401 every five minutes: overdue ops tasks were never flagged.
-- Same pattern as the other cron functions: a Vault secret the job sends and
-- the function checks with cron_secret_ok(). cron.schedule() with an existing
-- job name replaces that job's command.
DO $$
BEGIN
  IF to_regnamespace('vault') IS NULL OR to_regnamespace('cron') IS NULL THEN
    RETURN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'ops_task_watcher_cron_secret') THEN
    PERFORM vault.create_secret(
      replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
      'ops_task_watcher_cron_secret',
      'Bearer token the ops-task-watcher cron job sends to ops-task-watcher');
  END IF;
  PERFORM cron.schedule(
    'ops-task-watcher',
    '*/5 * * * *',
    $cmd$
    SELECT net.http_post(
      url := 'https://skxxvgjjdshcopybokdt.supabase.co/functions/v1/ops-task-watcher',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets
                                       WHERE name = 'ops_task_watcher_cron_secret')),
      body := '{}'::jsonb
    ) AS request_id;
    $cmd$);
END $$;
