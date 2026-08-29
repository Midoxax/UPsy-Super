
-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  psychologist_id uuid NOT NULL REFERENCES public.psychologist_profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (session_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Clients can insert reviews for their own completed sessions
CREATE POLICY "Clients can insert own reviews" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = client_id
    AND EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = session_id
        AND s.client_id = auth.uid()
        AND s.status = 'completed'
    )
  );

-- Clients can view own reviews
CREATE POLICY "Clients can view own reviews" ON public.reviews
  FOR SELECT USING (auth.uid() = client_id);

-- Psychologists can view their reviews
CREATE POLICY "Psychologists can view own reviews" ON public.reviews
  FOR SELECT USING (auth.uid() = psychologist_id);

-- Public can view all reviews (for profile pages)
CREATE POLICY "Public can view reviews" ON public.reviews
  FOR SELECT USING (true);

-- Admins can manage all
CREATE POLICY "Admins can manage reviews" ON public.reviews
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));
