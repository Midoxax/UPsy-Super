-- Per-booking reminder preferences
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS patient_phone TEXT,
  ADD COLUMN IF NOT EXISTS reminder_24h_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS reminder_1h_enabled  BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS reminder_5min_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS reminder_channels JSONB NOT NULL DEFAULT '["email","in_app"]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_bookings_upcoming_status
  ON public.bookings (scheduled_at)
  WHERE status IN ('confirmed','pending','proposed');

-- Reminder dispatch ledger
CREATE TABLE IF NOT EXISTS public.booking_reminders_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24h','1h','5min')),
  recipient_role TEXT NOT NULL CHECK (recipient_role IN ('client','specialist')),
  channel TEXT NOT NULL CHECK (channel IN ('email','in_app','whatsapp','whatsapp_api','ics')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (booking_id, reminder_type, recipient_role, channel)
);

CREATE INDEX IF NOT EXISTS idx_booking_reminders_sent_booking
  ON public.booking_reminders_sent (booking_id, reminder_type, recipient_role);

ALTER TABLE public.booking_reminders_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their reminders"
  ON public.booking_reminders_sent
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_reminders_sent.booking_id
        AND (b.patient_id = auth.uid() OR b.psychologist_id = auth.uid())
    )
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can manage reminders"
  ON public.booking_reminders_sent
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
-- (Service role / SECURITY DEFINER paths bypass RLS for inserts from the cron.)