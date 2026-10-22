-- Reviews for the booking system.
--
-- Reviews could only be written against a completed row of the legacy
-- `sessions` table, which the booking flow no longer creates, and the public
-- read policy had been dropped. So no client could leave a review and no
-- profile could show one: the "Review" button on past sessions did nothing
-- and every psychologist read as unrated.

ALTER TABLE public.reviews ALTER COLUMN session_id DROP NOT NULL;
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS booking_id uuid UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE;
DO $$ BEGIN
  ALTER TABLE public.reviews ADD CONSTRAINT reviews_has_source
    CHECK (session_id IS NOT NULL OR booking_id IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- A client may review a psychologist once per session that took place:
-- a completed booking, or a confirmed one whose time has passed.
DROP POLICY IF EXISTS "Clients can insert own reviews" ON public.reviews;
CREATE POLICY "Clients can insert own reviews" ON public.reviews FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = client_id
  AND (
    EXISTS (SELECT 1 FROM public.sessions s
            WHERE s.id = reviews.session_id AND s.client_id = auth.uid() AND s.status = 'completed')
    OR EXISTS (SELECT 1 FROM public.bookings b
               WHERE b.id = reviews.booking_id
                 AND b.patient_id = auth.uid()
                 AND b.psychologist_id = reviews.psychologist_id
                 AND (b.status = 'completed' OR (b.status = 'confirmed' AND b.scheduled_at < now())))
  )
);

-- Public reading without the reviewer's identity.
CREATE OR REPLACE FUNCTION public.psychologist_reviews(p_psychologist uuid, p_limit int DEFAULT 20)
RETURNS TABLE (id uuid, rating smallint, comment text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, r.rating::smallint, r.comment, r.created_at
  FROM public.reviews r
  WHERE r.psychologist_id = p_psychologist
  ORDER BY r.created_at DESC
  LIMIT least(coalesce(p_limit, 20), 100)
$$;
REVOKE ALL ON FUNCTION public.psychologist_reviews(uuid, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.psychologist_reviews(uuid, int) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.psychologist_rating(p_psychologist uuid)
RETURNS TABLE (avg_rating numeric, n bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT round(avg(rating)::numeric, 1), count(*) FROM public.reviews WHERE psychologist_id = p_psychologist
$$;
REVOKE ALL ON FUNCTION public.psychologist_rating(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.psychologist_rating(uuid) TO anon, authenticated;
