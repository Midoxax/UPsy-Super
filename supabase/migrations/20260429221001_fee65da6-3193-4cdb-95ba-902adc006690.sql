ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check
  CHECK (status = ANY (ARRAY['pending','proposed','confirmed','completed','cancelled','no_show']));

CREATE OR REPLACE FUNCTION public.admin_update_booking_status(_booking_id uuid, _new_status text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF _new_status NOT IN ('pending','proposed','confirmed','completed','no_show','cancelled') THEN
    RAISE EXCEPTION 'Invalid status: %', _new_status;
  END IF;

  UPDATE public.bookings
  SET status = _new_status, updated_at = now()
  WHERE id = _booking_id;

  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, metadata)
  VALUES (auth.uid(), 'booking.status_changed', 'bookings', _booking_id,
          jsonb_build_object('new_status', _new_status));

  RETURN jsonb_build_object('ok', true, 'booking_id', _booking_id, 'status', _new_status);
END;
$function$;