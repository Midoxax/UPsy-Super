-- Directory ranking (rank_psychologists) looks up each psychologist's open
-- slots and reviews; give both lookups an index as the tables grow.
CREATE INDEX IF NOT EXISTS availability_slots_psychologist_id_idx
  ON public.availability_slots (psychologist_id);
CREATE INDEX IF NOT EXISTS reviews_psychologist_id_idx
  ON public.reviews (psychologist_id);

-- Exact duplicates of another index on the same columns, never used; each
-- one only costs writes. The copies that queries use are kept:
-- idx_audit_log_user, idx_bookings_psychologist,
-- idx_provisioning_attempts_app_created.
DROP INDEX IF EXISTS public.audit_log_actor_idx;
DROP INDEX IF EXISTS public.idx_bookings_psy_scheduled;
DROP INDEX IF EXISTS public.idx_provisioning_attempts_app;
