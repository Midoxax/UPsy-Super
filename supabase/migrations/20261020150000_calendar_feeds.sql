-- Calendar: a private subscription feed per user, and a record of which
-- booking emails went out.

-- 1. Each user can subscribe Google, Outlook or Apple Calendar to their
-- sessions through a secret feed URL (calendar-feed?token=…). Rotating the
-- link is delete + insert. Only the owner sees their token.
CREATE TABLE IF NOT EXISTS public.calendar_feeds (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE
    DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.calendar_feeds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calendar_feeds own select" ON public.calendar_feeds
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "calendar_feeds own insert" ON public.calendar_feeds
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "calendar_feeds own delete" ON public.calendar_feeds
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 2. booking-email sends one email per booking per status. This is how it
-- knows it already did, so a party cannot replay it to spam the other.
-- Service role only.
CREATE TABLE IF NOT EXISTS public.booking_emails (
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  status text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (booking_id, status)
);
ALTER TABLE public.booking_emails ENABLE ROW LEVEL SECURITY;
