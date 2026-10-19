-- Every table audited by log_sensitive_change() must accept inserts,
-- updates and deletes (it used to fail on all of them).
\set ON_ERROR_STOP 1
BEGIN;
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-0000000000b1', 'psy@test'),
  ('00000000-0000-0000-0000-0000000000c1', 'client@test');
INSERT INTO public.psychologist_profiles (id, full_name, slug)
  VALUES ('00000000-0000-0000-0000-0000000000b1', 'Dr Test', 'dr-test-w');
INSERT INTO public.sessions (id, client_id, psychologist_id, date_time)
  VALUES ('00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-0000000000c1',
          '00000000-0000-0000-0000-0000000000b1', now());
INSERT INTO public.assessments (id, title) VALUES ('00000000-0000-0000-0000-0000000000f2', 'GAD-7');

INSERT INTO public.session_notes (id, session_id, psychologist_id, content) VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-0000000000e2', '00000000-0000-0000-0000-0000000000b1', 'n');
UPDATE public.session_notes SET content = 'n2' WHERE id = '00000000-0000-0000-0000-000000000101';
INSERT INTO public.mood_entries (user_id, mood_score) VALUES ('00000000-0000-0000-0000-0000000000c1', 5);
INSERT INTO public.assessment_results (user_id, assessment_id)
  VALUES ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000f2');
INSERT INTO public.client_anamneses (id, client_id) VALUES
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-0000000000c1');
INSERT INTO public.treatment_plans (client_id, psychologist_id)
  VALUES ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000b1');
INSERT INTO public.homework_assignments (client_id, psychologist_id, title)
  VALUES ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000b1', 'h');
INSERT INTO public.discharge_summaries (client_id, psychologist_id)
  VALUES ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000b1');
DELETE FROM public.session_notes WHERE id = '00000000-0000-0000-0000-000000000101';

DO $$ BEGIN
  -- One owner-tagged row per write (insert, update, delete): the duplicate
  -- trigger is gone.
  IF (SELECT count(*) FROM public.audit_log
      WHERE resource_type = 'session_notes'
        AND metadata->>'owner_id' = '00000000-0000-0000-0000-0000000000b1') <> 3 THEN
    RAISE EXCEPTION 'FAILED: session note writes not audited exactly once with their owner';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.audit_log WHERE resource_type = 'client_anamneses'
      AND subject_id = '00000000-0000-0000-0000-0000000000c1') THEN
    RAISE EXCEPTION 'FAILED: intake form audit row does not name the client';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.audit_log WHERE resource_type = 'client_anamneses'
      AND metadata->>'owner_id' = '00000000-0000-0000-0000-0000000000c1') THEN
    RAISE EXCEPTION 'FAILED: intake form owner not recorded';
  END IF;
  RAISE NOTICE 'ok: clinical writes succeed and are audited with their owner';
END $$;
ROLLBACK;
