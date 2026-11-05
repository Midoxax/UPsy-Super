-- Clients may book only a published specialist. This already held implicitly
-- (the price check reads the rate of a profile the client can see, and only
-- published profiles are visible), but a later change to profile visibility
-- must not reopen bookings with unpublished or removed specialists.
DROP POLICY IF EXISTS "Patients can create bookings" ON public.bookings;
CREATE POLICY "Patients can create bookings" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = patient_id
    AND status = 'pending'
    AND (payment_status IS NULL OR payment_status = ANY (ARRAY['unpaid', 'pending_deposit']))
    AND duration_minutes IS NOT NULL AND duration_minutes > 0
    AND amount_mad IS NOT NULL AND amount_mad >= 0
    AND EXISTS (
      SELECT 1 FROM public.psychologist_profiles p
      WHERE p.id = bookings.psychologist_id
        AND p.is_published
        AND amount_mad = round(p.hourly_rate_mad * duration_minutes::numeric / 60.0, 2)
    )
  );
