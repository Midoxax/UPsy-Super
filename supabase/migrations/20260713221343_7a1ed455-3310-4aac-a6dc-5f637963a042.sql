
-- Tighten patient bookings INSERT policy: validate amount_mad against psychologist's rate.
DROP POLICY IF EXISTS "Patients can create bookings" ON public.bookings;

CREATE POLICY "Patients can create bookings"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = patient_id
  AND status = 'pending'
  AND (payment_status IS NULL OR payment_status IN ('unpaid', 'pending_deposit'))
  AND duration_minutes IS NOT NULL
  AND duration_minutes > 0
  AND amount_mad IS NOT NULL
  AND amount_mad >= 0
  AND amount_mad = ROUND(
    (SELECT p.hourly_rate_mad FROM public.psychologist_profiles p WHERE p.id = bookings.psychologist_id)
    * duration_minutes / 60.0,
    2
  )
);
