
-- 1. Add gender column to psychologist_profiles
ALTER TABLE public.psychologist_profiles
  ADD COLUMN IF NOT EXISTS gender text DEFAULT NULL;

-- 2. Create therapy_approaches lookup table
CREATE TABLE public.therapy_approaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.therapy_approaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view therapy approaches"
  ON public.therapy_approaches FOR SELECT
  USING (true);

-- 3. Junction: psychologist <-> therapy_approach
CREATE TABLE public.psychologist_therapy_approaches (
  psychologist_id uuid NOT NULL REFERENCES public.psychologist_profiles(id) ON DELETE CASCADE,
  therapy_approach_id uuid NOT NULL REFERENCES public.therapy_approaches(id) ON DELETE CASCADE,
  PRIMARY KEY (psychologist_id, therapy_approach_id)
);

ALTER TABLE public.psychologist_therapy_approaches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published profile therapy approaches"
  ON public.psychologist_therapy_approaches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM psychologist_profiles
      WHERE psychologist_profiles.id = psychologist_therapy_approaches.psychologist_id
        AND psychologist_profiles.is_published = true
    )
  );

CREATE POLICY "Psychologists can manage own therapy approaches"
  ON public.psychologist_therapy_approaches FOR ALL
  USING (auth.uid() = psychologist_id);

-- 4. Create availability_slots table
CREATE TABLE public.availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id uuid NOT NULL REFERENCES public.psychologist_profiles(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published profile availability"
  ON public.availability_slots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM psychologist_profiles
      WHERE psychologist_profiles.id = availability_slots.psychologist_id
        AND psychologist_profiles.is_published = true
    )
  );

CREATE POLICY "Psychologists can manage own availability"
  ON public.availability_slots FOR ALL
  USING (auth.uid() = psychologist_id);

-- 5. Seed therapy approaches
INSERT INTO public.therapy_approaches (name) VALUES
  ('CBT'),
  ('Psychodynamic'),
  ('Mindfulness'),
  ('Trauma-Informed'),
  ('Humanistic'),
  ('EMDR'),
  ('ACT'),
  ('DBT');

-- 6. Update search_psychologists to support new filters
CREATE OR REPLACE FUNCTION public.search_psychologists(
  p_specialties uuid[] DEFAULT '{}'::uuid[],
  p_languages uuid[] DEFAULT '{}'::uuid[],
  p_therapy_approaches uuid[] DEFAULT '{}'::uuid[],
  p_city text DEFAULT NULL,
  p_online boolean DEFAULT NULL,
  p_in_person boolean DEFAULT NULL,
  p_gender text DEFAULT NULL,
  p_availability text DEFAULT NULL,
  p_min_price numeric DEFAULT 0,
  p_max_price numeric DEFAULT 2000,
  p_page integer DEFAULT 1,
  p_page_size integer DEFAULT 12
)
RETURNS TABLE(
  id uuid, full_name text, bio text, city text, photo_url text,
  hourly_rate_mad numeric, slug text, offers_in_person boolean,
  offers_online boolean, is_accredited boolean, calendly_url text,
  created_at timestamptz, updated_at timestamptz, is_published boolean,
  gender text, total_count bigint
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_offset integer;
  v_today_dow smallint;
BEGIN
  v_offset := (p_page - 1) * p_page_size;
  v_today_dow := EXTRACT(DOW FROM now())::smallint;

  RETURN QUERY
  WITH filtered_profiles AS (
    SELECT DISTINCT pp.*
    FROM psychologist_profiles pp
    WHERE pp.is_published = true
      AND (p_city IS NULL OR pp.city ILIKE '%' || p_city || '%')
      AND (p_gender IS NULL OR pp.gender = p_gender)
      AND (
        (p_online IS NULL AND p_in_person IS NULL) OR
        (p_online = true AND p_in_person IS NULL AND pp.offers_online = true) OR
        (p_in_person = true AND p_online IS NULL AND pp.offers_in_person = true) OR
        (p_online = true AND p_in_person = true AND (pp.offers_online = true OR pp.offers_in_person = true))
      )
      AND (pp.hourly_rate_mad IS NULL OR pp.hourly_rate_mad >= p_min_price)
      AND (pp.hourly_rate_mad IS NULL OR pp.hourly_rate_mad <= p_max_price)
      AND (
        cardinality(p_specialties) = 0 OR
        EXISTS (SELECT 1 FROM psychologist_specialties ps WHERE ps.psychologist_id = pp.id AND ps.specialty_id = ANY(p_specialties))
      )
      AND (
        cardinality(p_languages) = 0 OR
        EXISTS (SELECT 1 FROM psychologist_languages pl WHERE pl.psychologist_id = pp.id AND pl.language_id = ANY(p_languages))
      )
      AND (
        cardinality(p_therapy_approaches) = 0 OR
        EXISTS (SELECT 1 FROM psychologist_therapy_approaches pta WHERE pta.psychologist_id = pp.id AND pta.therapy_approach_id = ANY(p_therapy_approaches))
      )
      AND (
        p_availability IS NULL OR
        p_availability = 'flexible' OR
        (p_availability = 'today' AND EXISTS (
          SELECT 1 FROM availability_slots a WHERE a.psychologist_id = pp.id AND a.day_of_week = v_today_dow AND a.is_available = true
        )) OR
        (p_availability = 'this_week' AND EXISTS (
          SELECT 1 FROM availability_slots a WHERE a.psychologist_id = pp.id AND a.is_available = true
        ))
      )
  ),
  total AS (
    SELECT count(*) as cnt FROM filtered_profiles
  )
  SELECT
    fp.id, fp.full_name, fp.bio, fp.city, fp.photo_url,
    fp.hourly_rate_mad, fp.slug, fp.offers_in_person, fp.offers_online,
    fp.is_accredited, fp.calendly_url, fp.created_at, fp.updated_at,
    fp.is_published, fp.gender,
    (SELECT cnt FROM total) as total_count
  FROM filtered_profiles fp
  ORDER BY fp.created_at DESC
  LIMIT p_page_size OFFSET v_offset;
END;
$$;
