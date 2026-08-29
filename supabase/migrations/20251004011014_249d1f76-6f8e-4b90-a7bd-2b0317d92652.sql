-- Add index on is_published for better query performance
CREATE INDEX IF NOT EXISTS idx_psychologist_profiles_is_published 
ON public.psychologist_profiles(is_published);

-- Add slug column for SEO-friendly URLs
ALTER TABLE public.psychologist_profiles 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_psychologist_profiles_slug 
ON public.psychologist_profiles(slug);

-- Function to generate slug from full name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT, id UUID) 
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  ) || '-' || substring(id::text from 1 for 8);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Backfill slugs for existing profiles
UPDATE public.psychologist_profiles
SET slug = generate_slug(full_name, id)
WHERE slug IS NULL;

-- Make slug NOT NULL after backfill
ALTER TABLE public.psychologist_profiles 
ALTER COLUMN slug SET NOT NULL;

-- Trigger to auto-generate slug on insert
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug = generate_slug(NEW.full_name, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_slug
BEFORE INSERT ON public.psychologist_profiles
FOR EACH ROW
EXECUTE FUNCTION auto_generate_slug();