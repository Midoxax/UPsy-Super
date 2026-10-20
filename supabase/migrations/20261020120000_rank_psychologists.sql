-- Ranked psychologist search, computed on the server.
--
-- Replaces the browse page's search_psychologists call, which sorted by
-- newest only (production still had an older signature the page could not
-- call). Hard filters narrow the list; the score orders it:
--
--   availability  next free weekday within 2 days 18, 7 days 12, 14 days 6
--   rating        Bayesian average (prior 4.5 over 5 reviews), up to 15
--   profile       photo 8, bio of 200+ chars 6, price set 4, slots set 4
--   accreditation full 8, provisional 4
--   boost         active search_boost/spotlight 12, highlight 4
--   plan          elite/premium 6, pro/basic 3
--   newcomer      first 60 days 3
--   query         name 20, specialty 12, city 8, bio 4
--
-- Ties rotate daily (md5 of id and date), so equal profiles share the top.
-- Only published, accredited profiles are listed.
CREATE OR REPLACE FUNCTION public.rank_psychologists(
  p_query text DEFAULT NULL,
  p_specialties uuid[] DEFAULT '{}',
  p_languages uuid[] DEFAULT '{}',
  p_therapy_approaches uuid[] DEFAULT '{}',
  p_city text DEFAULT NULL,
  p_online boolean DEFAULT NULL,
  p_in_person boolean DEFAULT NULL,
  p_gender text DEFAULT NULL,
  p_availability text DEFAULT NULL,
  p_min_price numeric DEFAULT NULL,
  p_max_price numeric DEFAULT NULL,
  p_sort text DEFAULT 'recommended',
  p_page integer DEFAULT 1,
  p_page_size integer DEFAULT 12
)
RETURNS TABLE (
  id uuid, full_name text, bio text, city text, photo_url text,
  hourly_rate_mad numeric, slug text, offers_in_person boolean,
  offers_online boolean, is_accredited boolean, accreditation_level text,
  calendly_url text, gender text, created_at timestamptz,
  rating_avg numeric, rating_count bigint, next_available date,
  score numeric, total_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH params AS (
    SELECT (now() AT TIME ZONE 'Africa/Casablanca') AS local_now,
           nullif(btrim(p_query), '') AS q
  ),
  base AS (
    SELECT pp.*
    FROM psychologist_profiles pp
    WHERE pp.is_published AND pp.is_accredited
      AND (p_city IS NULL OR pp.city ILIKE '%' || p_city || '%')
      AND (p_gender IS NULL OR pp.gender = p_gender)
      AND (p_online IS NOT TRUE OR pp.offers_online)
      AND (p_in_person IS NOT TRUE OR pp.offers_in_person)
      AND (p_min_price IS NULL OR pp.hourly_rate_mad >= p_min_price)
      AND (p_max_price IS NULL OR pp.hourly_rate_mad <= p_max_price)
      AND (cardinality(p_specialties) = 0 OR EXISTS (
        SELECT 1 FROM psychologist_specialties s
        WHERE s.psychologist_id = pp.id AND s.specialty_id = ANY (p_specialties)))
      AND (cardinality(p_languages) = 0 OR EXISTS (
        SELECT 1 FROM psychologist_languages l
        WHERE l.psychologist_id = pp.id AND l.language_id = ANY (p_languages)))
      AND (cardinality(p_therapy_approaches) = 0 OR EXISTS (
        SELECT 1 FROM psychologist_therapy_approaches a
        WHERE a.psychologist_id = pp.id AND a.therapy_approach_id = ANY (p_therapy_approaches)))
  ),
  -- Days until each weekday with an open slot; today counts only if the
  -- slot has not ended yet (Casablanca time).
  slot_days AS (
    SELECT a.psychologist_id,
           min(CASE
                 WHEN a.day_of_week = extract(dow FROM pr.local_now)::int
                      AND a.end_time > pr.local_now::time THEN 0
                 ELSE ((a.day_of_week - extract(dow FROM pr.local_now)::int + 6) % 7) + 1
               END) AS days_away
    FROM availability_slots a, params pr
    WHERE a.is_available AND coalesce(a.is_active, true)
      AND a.psychologist_id IN (SELECT id FROM base)
    GROUP BY a.psychologist_id
  ),
  ratings AS (
    SELECT r.psychologist_id, avg(r.rating)::numeric AS avg_rating, count(*) AS n
    FROM reviews r
    WHERE r.psychologist_id IN (SELECT id FROM base)
    GROUP BY r.psychologist_id
  ),
  plans AS (
    SELECT DISTINCT ON (s.psychologist_id) s.psychologist_id, s.plan_type
    FROM subscriptions s
    WHERE s.status = 'active' AND (s.ends_at IS NULL OR s.ends_at > now())
      AND s.psychologist_id IN (SELECT id FROM base)
    ORDER BY s.psychologist_id,
             CASE s.plan_type WHEN 'elite' THEN 1 WHEN 'premium' THEN 2 ELSE 3 END
  ),
  scored AS (
    SELECT b.*,
           sd.days_away,
           r.avg_rating, coalesce(r.n, 0) AS n_reviews,
           (
             CASE WHEN sd.days_away IS NULL THEN 0
                  WHEN sd.days_away <= 2 THEN 18
                  WHEN sd.days_away <= 7 THEN 12
                  ELSE 6 END
             + 15 * ((4.5 * 5 + coalesce(r.avg_rating * r.n, 0)) / (5 + coalesce(r.n, 0)) - 1) / 4
             + CASE WHEN b.photo_url IS NOT NULL THEN 8 ELSE 0 END
             + CASE WHEN length(coalesce(b.bio, '')) >= 200 THEN 6 ELSE 0 END
             + CASE WHEN b.hourly_rate_mad IS NOT NULL THEN 4 ELSE 0 END
             + CASE WHEN sd.days_away IS NOT NULL THEN 4 ELSE 0 END
             + CASE b.accreditation_level WHEN 'accredited' THEN 8 WHEN 'provisional' THEN 4 ELSE 0 END
             + CASE WHEN b.boosted_until > now() THEN
                 CASE WHEN b.boost_type IN ('search_boost', 'spotlight') THEN 12
                      WHEN b.boost_type = 'highlight' THEN 4 ELSE 0 END
               ELSE 0 END
             + CASE WHEN pl.plan_type IN ('elite', 'premium') THEN 6
                    WHEN pl.plan_type IN ('pro', 'basic') THEN 3 ELSE 0 END
             + CASE WHEN b.created_at > now() - interval '60 days' THEN 3 ELSE 0 END
             + CASE WHEN pr.q IS NULL THEN 0 ELSE
                 CASE WHEN b.full_name ILIKE '%' || pr.q || '%' THEN 20 ELSE 0 END
                 + CASE WHEN EXISTS (
                     SELECT 1 FROM psychologist_specialties s JOIN specialties sp ON sp.id = s.specialty_id
                     WHERE s.psychologist_id = b.id AND sp.name ILIKE '%' || pr.q || '%') THEN 12 ELSE 0 END
                 + CASE WHEN b.city ILIKE '%' || pr.q || '%' THEN 8 ELSE 0 END
                 + CASE WHEN b.bio ILIKE '%' || pr.q || '%' THEN 4 ELSE 0 END
               END
           )::numeric AS score
    FROM base b
    CROSS JOIN params pr
    LEFT JOIN slot_days sd ON sd.psychologist_id = b.id
    LEFT JOIN ratings r ON r.psychologist_id = b.id
    LEFT JOIN plans pl ON pl.psychologist_id = b.id
  ),
  matched AS (
    SELECT s.*
    FROM scored s, params pr
    WHERE (pr.q IS NULL
           OR s.full_name ILIKE '%' || pr.q || '%'
           OR s.city ILIKE '%' || pr.q || '%'
           OR s.bio ILIKE '%' || pr.q || '%'
           OR EXISTS (SELECT 1 FROM psychologist_specialties ps JOIN specialties sp ON sp.id = ps.specialty_id
                      WHERE ps.psychologist_id = s.id AND sp.name ILIKE '%' || pr.q || '%'))
      AND (p_availability IS NULL OR p_availability = 'flexible'
           OR (p_availability = 'today' AND s.days_away = 0)
           OR (p_availability = 'this_week' AND s.days_away <= 7))
  )
  SELECT m.id, m.full_name, m.bio, m.city, m.photo_url, m.hourly_rate_mad, m.slug,
         m.offers_in_person, m.offers_online, m.is_accredited, m.accreditation_level,
         m.calendly_url, m.gender, m.created_at,
         round(m.avg_rating, 2), m.n_reviews,
         CASE WHEN m.days_away IS NULL THEN NULL
              ELSE ((SELECT local_now FROM params)::date + m.days_away) END,
         round(m.score, 2),
         count(*) OVER ()
  FROM matched m
  ORDER BY
    CASE WHEN p_sort = 'price_asc' THEN m.hourly_rate_mad END ASC NULLS LAST,
    CASE WHEN p_sort = 'price_desc' THEN m.hourly_rate_mad END DESC NULLS LAST,
    CASE WHEN p_sort = 'rating' THEN coalesce(m.avg_rating, 0) END DESC,
    CASE WHEN p_sort = 'soonest' THEN coalesce(m.days_away, 99) END ASC,
    m.score DESC,
    md5(m.id::text || current_date::text)
  LIMIT greatest(p_page_size, 1) OFFSET greatest(p_page - 1, 0) * greatest(p_page_size, 1);
$$;

REVOKE ALL ON FUNCTION public.rank_psychologists(text, uuid[], uuid[], uuid[], text, boolean, boolean, text, text, numeric, numeric, text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rank_psychologists(text, uuid[], uuid[], uuid[], text, boolean, boolean, text, text, numeric, numeric, text, integer, integer) TO anon, authenticated;
