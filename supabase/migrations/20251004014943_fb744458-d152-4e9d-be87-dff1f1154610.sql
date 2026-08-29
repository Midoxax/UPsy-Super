-- Create function for efficient psychologist filtering with specialty and language support
CREATE OR REPLACE FUNCTION public.search_psychologists(
  p_specialties uuid[] DEFAULT '{}',
  p_languages uuid[] DEFAULT '{}',
  p_city text DEFAULT NULL,
  p_online boolean DEFAULT NULL,
  p_in_person boolean DEFAULT NULL,
  p_min_price numeric DEFAULT 0,
  p_max_price numeric DEFAULT 2000,
  p_page integer DEFAULT 1,
  p_page_size integer DEFAULT 12
)
RETURNS TABLE (
  id uuid,
  full_name text,
  bio text,
  city text,
  photo_url text,
  hourly_rate_mad numeric,
  slug text,
  offers_in_person boolean,
  offers_online boolean,
  is_accredited boolean,
  calendly_url text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  is_published boolean,
  total_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offset integer;
BEGIN
  v_offset := (p_page - 1) * p_page_size;
  
  RETURN QUERY
  WITH filtered_profiles AS (
    SELECT DISTINCT pp.*
    FROM psychologist_profiles pp
    WHERE pp.is_published = true
      -- City filter
      AND (p_city IS NULL OR pp.city ILIKE '%' || p_city || '%')
      -- Online/in-person filters
      AND (
        (p_online IS NULL AND p_in_person IS NULL) OR
        (p_online = true AND p_in_person IS NULL AND pp.offers_online = true) OR
        (p_in_person = true AND p_online IS NULL AND pp.offers_in_person = true) OR
        (p_online = true AND p_in_person = true AND (pp.offers_online = true OR pp.offers_in_person = true))
      )
      -- Price range filter
      AND pp.hourly_rate_mad >= p_min_price
      AND pp.hourly_rate_mad <= p_max_price
      -- Specialty filter
      AND (
        cardinality(p_specialties) = 0 OR
        EXISTS (
          SELECT 1 FROM psychologist_specialties ps
          WHERE ps.psychologist_id = pp.id
            AND ps.specialty_id = ANY(p_specialties)
        )
      )
      -- Language filter
      AND (
        cardinality(p_languages) = 0 OR
        EXISTS (
          SELECT 1 FROM psychologist_languages pl
          WHERE pl.psychologist_id = pp.id
            AND pl.language_id = ANY(p_languages)
        )
      )
  ),
  total AS (
    SELECT count(*) as cnt FROM filtered_profiles
  )
  SELECT 
    fp.*,
    (SELECT cnt FROM total) as total_count
  FROM filtered_profiles fp
  ORDER BY fp.created_at DESC
  LIMIT p_page_size
  OFFSET v_offset;
END;
$$;