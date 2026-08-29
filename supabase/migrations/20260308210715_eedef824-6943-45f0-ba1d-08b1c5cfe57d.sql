CREATE POLICY "Psychologists can view client profiles for their sessions"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.psychologist_id = auth.uid()
      AND s.client_id = profiles.id
  )
);