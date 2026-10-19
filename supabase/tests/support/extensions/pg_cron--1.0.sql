CREATE SCHEMA IF NOT EXISTS cron;
CREATE TABLE cron.job (jobid bigserial PRIMARY KEY, jobname text UNIQUE, schedule text, command text);
CREATE FUNCTION cron.schedule(job_name text, schedule text, command text) RETURNS bigint LANGUAGE sql AS
$$ INSERT INTO cron.job(jobname, schedule, command) VALUES (job_name, schedule, command)
   ON CONFLICT (jobname) DO UPDATE SET schedule = excluded.schedule, command = excluded.command RETURNING jobid $$;
CREATE FUNCTION cron.unschedule(job_name text) RETURNS boolean LANGUAGE plpgsql AS
$$ BEGIN DELETE FROM cron.job WHERE jobname = job_name; IF NOT FOUND THEN RAISE EXCEPTION 'could not find valid entry for job %', job_name; END IF; RETURN true; END $$;
