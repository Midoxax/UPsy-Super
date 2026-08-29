-- 1. Add new columns
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS proposed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS proposal_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS proposal_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS decline_reason text,
  ADD COLUMN IF NOT EXISTS patient_email text;

CREATE INDEX IF NOT EXISTS idx_bookings_proposal_token ON public.bookings(proposal_token) WHERE proposal_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_patient_email ON public.bookings(patient_email) WHERE patient_email IS NOT NULL;

-- 2. RLS: psychologist can insert proposed bookings for themselves
DROP POLICY IF EXISTS "Psychologists can propose sessions" ON public.bookings;
CREATE POLICY "Psychologists can propose sessions"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = psychologist_id
    AND status IN ('proposed', 'pending', 'confirmed')
  );

-- 3. RLS: anyone with a valid token can read that single booking (for the public response page)
DROP POLICY IF EXISTS "Public token holders can read proposal" ON public.bookings;
CREATE POLICY "Public token holders can read proposal"
  ON public.bookings
  FOR SELECT
  TO anon, authenticated
  USING (
    proposal_token IS NOT NULL
    AND proposal_expires_at IS NOT NULL
    AND proposal_expires_at > now()
  );

-- 4. Trigger: auto-generate video room when video booking becomes confirmed
CREATE OR REPLACE FUNCTION public.ensure_video_room_on_confirm()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'confirmed'
     AND NEW.session_type = 'video'
     AND (NEW.video_room_id IS NULL OR NEW.video_room_id = '')
  THEN
    NEW.video_room_id := 'upsy-' || replace(gen_random_uuid()::text, '-', '');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_video_room_on_confirm ON public.bookings;
CREATE TRIGGER trg_ensure_video_room_on_confirm
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_video_room_on_confirm();

-- 5. RPC for token-based response (used by public response page and edge function)
CREATE OR REPLACE FUNCTION public.respond_to_proposal(
  _token text,
  _action text,
  _reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking RECORD;
BEGIN
  IF _action NOT IN ('accept', 'decline') THEN
    RAISE EXCEPTION 'Invalid action';
  END IF;

  SELECT * INTO v_booking
  FROM public.bookings
  WHERE proposal_token = _token
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_token');
  END IF;

  IF v_booking.proposal_expires_at IS NULL OR v_booking.proposal_expires_at < now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'expired');
  END IF;

  IF v_booking.status NOT IN ('proposed') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_responded', 'status', v_booking.status);
  END IF;

  IF _action = 'accept' THEN
    UPDATE public.bookings
    SET status = 'confirmed',
        proposal_token = NULL,
        updated_at = now()
    WHERE id = v_booking.id;
    RETURN jsonb_build_object('ok', true, 'status', 'confirmed', 'booking_id', v_booking.id);
  ELSE
    UPDATE public.bookings
    SET status = 'cancelled',
        decline_reason = _reason,
        proposal_token = NULL,
        updated_at = now()
    WHERE id = v_booking.id;
    RETURN jsonb_build_object('ok', true, 'status', 'cancelled', 'booking_id', v_booking.id);
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.respond_to_proposal(text, text, text) TO anon, authenticated;