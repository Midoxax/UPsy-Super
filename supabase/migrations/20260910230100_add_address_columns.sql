-- Precise office address for in-person psychologists (replaces the city-only
-- pin used by the Maps Embed API) and the client's address captured at
-- booking time for in-person sessions. All nullable text/coordinates — no
-- backfill, no rewrite, no new RLS policy needed since both tables already
-- have policies scoped by row ownership.

ALTER TABLE public.psychologist_profiles
  ADD COLUMN office_address text,
  ADD COLUMN office_lat double precision,
  ADD COLUMN office_lng double precision;

ALTER TABLE public.bookings
  ADD COLUMN patient_address text,
  ADD COLUMN patient_lat double precision,
  ADD COLUMN patient_lng double precision;
