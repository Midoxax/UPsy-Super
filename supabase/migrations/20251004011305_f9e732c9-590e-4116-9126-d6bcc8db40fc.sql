-- Fix search_path for generate_slug function
CREATE OR REPLACE FUNCTION generate_slug(name TEXT, id UUID) 
RETURNS TEXT 
LANGUAGE plpgsql 
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  ) || '-' || substring(id::text from 1 for 8);
END;
$$;

-- Fix search_path for auto_generate_slug function
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug = generate_slug(NEW.full_name, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;