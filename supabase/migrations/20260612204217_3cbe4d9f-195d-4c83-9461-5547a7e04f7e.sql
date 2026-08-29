
-- 1) Bookings: prevent patients from rewriting sensitive immutable fields on UPDATE
CREATE OR REPLACE FUNCTION public.bookings_patient_update_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only enforce for non-admin, non-psychologist updaters (i.e. the patient).
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  IF auth.uid() = OLD.psychologist_id THEN
    RETURN NEW;
  END IF;

  -- Patient path: lock down sensitive columns
  IF NEW.psychologist_id IS DISTINCT FROM OLD.psychologist_id
     OR NEW.patient_id IS DISTINCT FROM OLD.patient_id
     OR NEW.amount_mad IS DISTINCT FROM OLD.amount_mad
     OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
     OR NEW.patient_email IS DISTINCT FROM OLD.patient_email
     OR NEW.patient_phone IS DISTINCT FROM OLD.patient_phone
     OR NEW.video_room_id IS DISTINCT FROM OLD.video_room_id
     OR NEW.proposal_token IS DISTINCT FROM OLD.proposal_token
     OR NEW.proposal_expires_at IS DISTINCT FROM OLD.proposal_expires_at
     OR NEW.proposed_by IS DISTINCT FROM OLD.proposed_by
  THEN
    RAISE EXCEPTION 'patients_cannot_modify_restricted_booking_fields';
  END IF;

  -- Patients may only move bookings to cancelled (or keep current status)
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'cancelled' THEN
    RAISE EXCEPTION 'patients_can_only_cancel_bookings';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_patient_update_guard_trg ON public.bookings;
CREATE TRIGGER bookings_patient_update_guard_trg
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.bookings_patient_update_guard();

-- Tighten the existing patient UPDATE policy with a WITH CHECK
DROP POLICY IF EXISTS "Patients can update own bookings" ON public.bookings;
CREATE POLICY "Patients can update own bookings"
ON public.bookings
FOR UPDATE
USING (auth.uid() = patient_id)
WITH CHECK (auth.uid() = patient_id);

-- 2) specialist_plans: allow authenticated users to read active plans
DROP POLICY IF EXISTS "Authenticated can view active plans" ON public.specialist_plans;
CREATE POLICY "Authenticated can view active plans"
ON public.specialist_plans
FOR SELECT
TO authenticated
USING (true);

-- 3) org_pulse_responses: ensure submission_token is a cryptographically random value by default
ALTER TABLE public.org_pulse_responses
  ALTER COLUMN submission_token SET DEFAULT gen_random_uuid()::text;
