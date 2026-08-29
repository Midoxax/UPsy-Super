-- Phase D: meeting rooms hardening

-- 1) Auto-generate a deterministic video_room_id on bookings (UUID prefixed) so room IDs are unguessable
CREATE OR REPLACE FUNCTION public.set_booking_video_room()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.video_room_id IS NULL OR NEW.video_room_id = '' THEN
    NEW.video_room_id := 'upsy-' || replace(gen_random_uuid()::text, '-', '');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_set_video_room ON public.bookings;
CREATE TRIGGER bookings_set_video_room
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.set_booking_video_room();

-- Backfill existing bookings without a room id
UPDATE public.bookings
SET video_room_id = 'upsy-' || replace(gen_random_uuid()::text, '-', '')
WHERE video_room_id IS NULL OR video_room_id = '';

-- Mirror to legacy sessions table (used by dashboards) when present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='sessions' AND column_name='video_room_id') THEN
    UPDATE public.sessions
    SET video_room_id = 'upsy-' || replace(gen_random_uuid()::text, '-', '')
    WHERE video_room_id IS NULL OR video_room_id = '';
  END IF;
END $$;

-- 2) Audit table for join/leave events (Phase E groundwork too)
CREATE TABLE IF NOT EXISTS public.session_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  session_id uuid,
  user_id uuid NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('joined','left','connection_failed','recording_started','recording_stopped')),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_events_booking ON public.session_events(booking_id);
CREATE INDEX IF NOT EXISTS idx_session_events_user ON public.session_events(user_id);

ALTER TABLE public.session_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants insert own events" ON public.session_events;
CREATE POLICY "Participants insert own events"
ON public.session_events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Participants view session events" ON public.session_events;
CREATE POLICY "Participants view session events"
ON public.session_events FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = session_events.booking_id
      AND (b.patient_id = auth.uid() OR b.psychologist_id = auth.uid())
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);