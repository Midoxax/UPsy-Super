CREATE OR REPLACE FUNCTION public.bookings_patient_insert_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  official_rate numeric;
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  IF auth.uid() = NEW.psychologist_id THEN
    RETURN NEW;
  END IF;
  IF auth.uid() IS DISTINCT FROM NEW.patient_id THEN
    RETURN NEW;
  END IF;

  NEW.proposal_token := NULL;
  NEW.proposal_expires_at := NULL;
  NEW.proposed_by := NULL;
  NEW.video_room_id := NULL;
  NEW.payment_status := 'unpaid';
  NEW.status := 'pending';

  -- Price is server-derived from the specialist's published rate; the patient
  -- cannot supply or influence amount_mad.
  SELECT p.hourly_rate_mad INTO official_rate
  FROM public.psychologist_profiles p
  WHERE p.id = NEW.psychologist_id;

  NEW.amount_mad := official_rate;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS bookings_patient_insert_guard_trg ON public.bookings;
CREATE TRIGGER bookings_patient_insert_guard_trg
BEFORE INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.bookings_patient_insert_guard();