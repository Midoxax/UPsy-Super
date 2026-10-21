-- Behaviour test for 20261021110000_psychologist_map.sql.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO anon;

INSERT INTO auth.users (id, email) SELECT ('00000000-0000-0000-0000-0000000005' || x || '1')::uuid, x || '@map.test'
  FROM unnest(ARRAY['a','b','c']) x;

-- a: office in Casablanca (Maarif); b: Rabat, city only; c: online only, no city.
INSERT INTO public.psychologist_profiles
  (id, full_name, slug, city, office_lat, office_lng, is_published, is_accredited, offers_online, offers_in_person)
VALUES
  ('00000000-0000-0000-0000-0000000005a1', 'Map Casa', 'map-casa', 'Casablanca - Mohammedia', 33.5800, -7.6300, true, true, false, true),
  ('00000000-0000-0000-0000-0000000005b1', 'Map Rabat', 'map-rabat', 'Rabat', NULL, NULL, true, true, false, true),
  ('00000000-0000-0000-0000-0000000005c1', 'Map Online', 'map-online', NULL, NULL, NULL, true, true, true, false);

SET LOCAL ROLE anon;
SELECT pg_temp.expect((SELECT location_precise AND map_lat = 33.58 FROM public.rank_psychologists() WHERE slug = 'map-casa'),
  'an office address is used precisely');
SELECT pg_temp.expect((SELECT NOT location_precise AND round(map_lat::numeric, 2) = 34.02 FROM public.rank_psychologists() WHERE slug = 'map-rabat'),
  'a city-only profile sits at the city centre');
SELECT pg_temp.expect((SELECT map_lat IS NULL FROM public.rank_psychologists() WHERE slug = 'map-online'),
  'no city, no pin');
SELECT pg_temp.expect((SELECT distance_km IS NULL FROM public.rank_psychologists() WHERE slug = 'map-casa'),
  'no distance without a position');

-- Visitor in Rabat: Rabat first, Casablanca about 87 km, online last.
SELECT pg_temp.expect((SELECT array_agg(slug) FROM public.rank_psychologists(p_sort => 'nearest', p_near_lat => 34.0209, p_near_lng => -6.8416)
  WHERE slug LIKE 'map-%') = '{map-rabat,map-casa,map-online}', 'nearest sorts in-person by distance, online last');
SELECT pg_temp.expect((SELECT distance_km BETWEEN 80 AND 95 FROM public.rank_psychologists(p_near_lat => 34.0209, p_near_lng => -6.8416)
  WHERE slug = 'map-casa'), 'distance in km');
RESET ROLE;

ROLLBACK;
