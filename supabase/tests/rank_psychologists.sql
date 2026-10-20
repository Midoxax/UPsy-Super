-- Behaviour test for 20261020120000_rank_psychologists.sql.
\set ON_ERROR_STOP 1
BEGIN;

CREATE FUNCTION pg_temp.expect(_ok boolean, _what text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF NOT coalesce(_ok, false) THEN RAISE EXCEPTION 'FAILED: %', _what; END IF;
      RAISE NOTICE 'ok: %', _what; END $$;
GRANT EXECUTE ON FUNCTION pg_temp.expect(boolean, text) TO anon;

INSERT INTO auth.users (id, email) SELECT ('00000000-0000-0000-0000-0000000004' || x || '1')::uuid, x || '@rank.test'
  FROM unnest(ARRAY['a','b','c','d']) x;

-- a: complete profile, slots every day; b: bare profile; c: unpublished;
-- d: not accredited.
INSERT INTO public.psychologist_profiles
  (id, full_name, slug, city, bio, photo_url, hourly_rate_mad, is_published, is_accredited, accreditation_level, offers_online)
VALUES
  ('00000000-0000-0000-0000-0000000004a1', 'Amina Complete', 'amina', 'Casablanca', repeat('x', 250), 'p.jpg', 500, true, true, 'accredited', true),
  ('00000000-0000-0000-0000-0000000004b1', 'Bilal Bare', 'bilal', 'Rabat', NULL, NULL, NULL, true, true, 'provisional', false),
  ('00000000-0000-0000-0000-0000000004c1', 'Chafik Hidden', 'chafik', 'Rabat', NULL, NULL, 400, false, true, 'accredited', true),
  ('00000000-0000-0000-0000-0000000004d1', 'Dounia Unverified', 'dounia', 'Rabat', NULL, NULL, 400, true, false, NULL, true);
INSERT INTO public.availability_slots (psychologist_id, day_of_week, start_time, end_time, is_available)
  SELECT '00000000-0000-0000-0000-0000000004a1', d, '00:00', '23:59', true FROM generate_series(0, 6) d;
INSERT INTO public.specialties (id, name) VALUES ('00000000-0000-0000-0000-0000000004f1', 'Anxiété sportive');
INSERT INTO public.psychologist_specialties VALUES ('00000000-0000-0000-0000-0000000004b1', '00000000-0000-0000-0000-0000000004f1');

SET LOCAL ROLE anon;
SELECT pg_temp.expect((SELECT array_agg(slug ORDER BY slug) FROM public.rank_psychologists() WHERE slug IN ('amina','bilal','chafik','dounia')) = '{amina,bilal}',
  'only published, accredited profiles are listed');
SELECT pg_temp.expect((SELECT slug FROM public.rank_psychologists() WHERE slug IN ('amina','bilal') LIMIT 1) = 'amina',
  'complete, available profile ranks first');
SELECT pg_temp.expect((SELECT next_available FROM public.rank_psychologists() WHERE slug = 'amina')
  <= (now() AT TIME ZONE 'Africa/Casablanca')::date + 1, 'next availability is today or tomorrow');
SELECT pg_temp.expect((SELECT array_agg(slug) FROM public.rank_psychologists(p_query => 'anxiété') WHERE slug IN ('amina','bilal','chafik','dounia')) = '{bilal}',
  'text search matches specialty names');
SELECT pg_temp.expect((SELECT array_agg(slug) FROM public.rank_psychologists(p_query => 'rabat') WHERE slug IN ('amina','bilal','chafik','dounia')) = '{bilal}',
  'text search matches city');
SELECT pg_temp.expect((SELECT array_agg(slug) FROM public.rank_psychologists(p_online => true) WHERE slug IN ('amina','bilal','chafik','dounia')) = '{amina}',
  'online filter');
SELECT pg_temp.expect((SELECT array_agg(slug) FROM public.rank_psychologists(p_max_price => 450) WHERE slug IN ('amina','bilal','chafik','dounia')) IS NULL,
  'price filter excludes profiles without a price');
SELECT pg_temp.expect((SELECT array_agg(slug) FROM public.rank_psychologists(p_availability => 'this_week') WHERE slug IN ('amina','bilal','chafik','dounia')) = '{amina}',
  'availability filter uses real slots');
SELECT pg_temp.expect((SELECT total_count FROM public.rank_psychologists(p_page_size => 1) LIMIT 1)
    = (SELECT count(*) FROM public.rank_psychologists(p_page_size => 100))
  AND (SELECT count(*) FROM public.rank_psychologists(p_page_size => 1) WHERE slug IN ('amina','bilal','chafik','dounia')) = 1, 'pagination keeps the total');
RESET ROLE;
ROLLBACK;
