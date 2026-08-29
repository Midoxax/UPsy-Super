
-- Translation overrides table
CREATE TABLE public.translation_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locale text NOT NULL CHECK (locale IN ('en', 'fr', 'ar')),
  translation_key text NOT NULL,
  translation_value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid,
  UNIQUE (locale, translation_key)
);

-- Enable RLS
ALTER TABLE public.translation_overrides ENABLE ROW LEVEL SECURITY;

-- Admin-only write access
CREATE POLICY "Admins can manage translations"
  ON public.translation_overrides
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Public read access (so all users see overrides)
CREATE POLICY "Public can read translations"
  ON public.translation_overrides
  FOR SELECT
  TO anon, authenticated
  USING (true);
