-- 1. Drop the over-permissive public proposal policy
DROP POLICY IF EXISTS "Public token holders can read proposal" ON public.bookings;

-- 2. Secure token-based fetch: only returns the row matching the token, when active
CREATE OR REPLACE FUNCTION public.get_booking_by_token(_token text)
RETURNS TABLE(
  id uuid,
  scheduled_at timestamptz,
  duration_minutes integer,
  session_type text,
  patient_notes text,
  psychologist_id uuid,
  proposal_expires_at timestamptz,
  status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.id, b.scheduled_at, b.duration_minutes, b.session_type,
         b.patient_notes, b.psychologist_id, b.proposal_expires_at, b.status
  FROM public.bookings b
  WHERE b.proposal_token = _token
    AND b.proposal_expires_at IS NOT NULL
    AND b.proposal_expires_at > now()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_booking_by_token(text) TO anon, authenticated;

-- 3. Org owners can read their own org's pulse responses (raw rows are anonymous)
DROP POLICY IF EXISTS "Org owners can read their org pulse responses" ON public.org_pulse_responses;
CREATE POLICY "Org owners can read their org pulse responses"
  ON public.org_pulse_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_accounts oa
      WHERE oa.id = org_pulse_responses.org_id
        AND oa.owner_id = auth.uid()
    )
  );