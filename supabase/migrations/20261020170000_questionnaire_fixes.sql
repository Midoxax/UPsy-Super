-- Questionnaire fixes.
--
-- 1) mark_anamnesis_reviewed(): psychologists only have SELECT on
--    client_anamneses, so the drawer's "mark reviewed" UPDATE matched 0 rows
--    and silently did nothing. This SECURITY DEFINER function performs the
--    review for the anamnesis' own psychologist (or an admin) only.
--
-- 2) Crisis alerts: rows inserted into crisis_alerts were never read by
--    anyone. An AFTER INSERT trigger now drops an in-app notification on the
--    client's psychologist (when known) and on every admin. The notification
--    carries no clinical content.

-- ---------------------------------------------------------------------------
-- 1) mark_anamnesis_reviewed
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mark_anamnesis_reviewed(
  p_id uuid,
  p_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller uuid := auth.uid();
  _row public.client_anamneses%ROWTYPE;
  _is_admin boolean;
  _is_psy boolean;
BEGIN
  IF _caller IS NULL THEN
    RAISE EXCEPTION 'authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO _row FROM public.client_anamneses WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'anamnesis not found' USING ERRCODE = 'P0002';
  END IF;

  _is_admin := public.has_role(_caller, 'admin'::app_role);
  -- The row's psychologist; for rows created before psychologist_id was
  -- filled in, the psychologist booked by that client.
  _is_psy := _row.psychologist_id = _caller
    OR (_row.psychologist_id IS NULL AND EXISTS (
          SELECT 1 FROM public.bookings b
          WHERE b.psychologist_id = _caller AND b.patient_id = _row.client_id));

  IF NOT (_is_psy OR _is_admin) THEN
    RAISE EXCEPTION 'not allowed to review this anamnesis' USING ERRCODE = '42501';
  END IF;
  IF _row.shared_with_psy_at IS NULL AND _row.status NOT IN ('completed', 'reviewed') THEN
    RAISE EXCEPTION 'anamnesis has not been shared yet' USING ERRCODE = '22023';
  END IF;

  UPDATE public.client_anamneses
     SET status = 'reviewed',
         reviewed_at = now(),
         psychologist_id = CASE WHEN psychologist_id IS NULL AND _is_psy
                                THEN _caller ELSE psychologist_id END,
         goals = CASE WHEN length(btrim(coalesce(p_notes, ''))) > 0
                      THEN coalesce(goals, '{}'::jsonb)
                           || jsonb_build_object('review_notes', btrim(p_notes))
                      ELSE goals END
   WHERE id = p_id;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_anamnesis_reviewed(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_anamnesis_reviewed(uuid, text) TO authenticated;

-- ---------------------------------------------------------------------------
-- 2) Crisis alert notifications
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_crisis_alert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _psy uuid;
  _admins int := 0;
  _title constant text := 'Alerte de sécurité';
  -- Deliberately generic: no score, item or answer is ever included.
  _body constant text := 'A client''s intake flagged a safety concern — review now';
BEGIN
  -- The client's psychologist, only through rows that belong to this client
  -- (the client writes intake_form_id / booking_id themselves).
  IF NEW.intake_form_id IS NOT NULL THEN
    SELECT a.psychologist_id INTO _psy
      FROM public.client_anamneses a
     WHERE a.id = NEW.intake_form_id AND a.client_id = NEW.client_id;
  END IF;
  IF _psy IS NULL AND NEW.booking_id IS NOT NULL THEN
    SELECT b.psychologist_id INTO _psy
      FROM public.bookings b
     WHERE b.id = NEW.booking_id AND b.patient_id = NEW.client_id;
  END IF;
  IF _psy IS NULL THEN
    SELECT b.psychologist_id INTO _psy
      FROM public.bookings b
     WHERE b.patient_id = NEW.client_id
       AND b.status IN ('pending', 'confirmed', 'completed')
     ORDER BY b.scheduled_at DESC
     LIMIT 1;
  END IF;

  IF _psy IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, action_url, metadata)
    VALUES (_psy, 'crisis_alert', _title, _body, '/dashboard/specialist',
            jsonb_build_object('crisis_alert_id', NEW.id));
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, action_url, metadata)
  SELECT DISTINCT ur.user_id, 'crisis_alert', _title, _body, '/admin',
         jsonb_build_object('crisis_alert_id', NEW.id)
    FROM public.user_roles ur
   WHERE ur.role = 'admin'::app_role
     AND ur.user_id IS DISTINCT FROM _psy;
  GET DIAGNOSTICS _admins = ROW_COUNT;

  UPDATE public.crisis_alerts
     SET notified_psy = (_psy IS NOT NULL),
         notified_admin = (_admins > 0)
   WHERE id = NEW.id;

  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_crisis_alert() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_crisis_alert_notify ON public.crisis_alerts;
CREATE TRIGGER trg_crisis_alert_notify
  AFTER INSERT ON public.crisis_alerts
  FOR EACH ROW EXECUTE FUNCTION public.notify_crisis_alert();
