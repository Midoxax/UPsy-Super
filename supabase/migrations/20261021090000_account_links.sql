-- Re-link accounts, profiles and bookings.
--
-- Production was re-created from a dump in September 2026. A dump does not
-- carry triggers on auth.users, so since then:
--   * new signups get no public.profiles row and no default membership,
--     which is why they never appear in the admin users list;
-- and the FK from psychologist_profiles to auth.users was gone, so:
--   * the published "Mehdi Felji" profile (every booking and slot) is keyed
--     to an account id that no longer exists. Bookings never reached a
--     dashboard, booking-email found no specialist address, and saving
--     availability as the real account failed the slots FK.

-- 1. Signup triggers, as defined in 20260308202515 and 20260526201634.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_default_membership ON auth.users;
CREATE TRIGGER on_auth_user_default_membership
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_default_membership();

-- Backfill what the missing triggers would have written.
INSERT INTO public.profiles (id, full_name)
SELECT u.id, coalesce(u.raw_user_meta_data->>'full_name', u.email)
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_memberships (user_id, tier, status)
SELECT u.id, 'discover', 'active'
FROM auth.users u
ON CONFLICT (user_id, tier) DO NOTHING;

-- 2. Let a profile id change carry its bookings, slots and the rest along.
DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT con.conname, con.conrelid::regclass AS tbl, a.attname AS col,
           CASE con.confdeltype WHEN 'c' THEN 'CASCADE' WHEN 'n' THEN 'SET NULL'
                                ELSE 'NO ACTION' END AS on_delete
    FROM pg_constraint con
    JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = con.conkey[1]
    WHERE con.contype = 'f'
      AND con.confrelid = 'public.psychologist_profiles'::regclass
      AND con.confupdtype <> 'c'
  LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', c.tbl, c.conname);
    EXECUTE format(
      'ALTER TABLE %s ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES public.psychologist_profiles(id) ON UPDATE CASCADE ON DELETE %s',
      c.tbl, c.conname, c.col, c.on_delete);
  END LOOP;
END $$;

-- 3. Hand the orphaned published profile to the founder's account
-- (midoxax@gmail.com). No-op anywhere those rows do not exist.
DO $$
DECLARE
  _old uuid := '6b5abd90-ec31-4013-b6d2-f28848b1e7fe';
  _new uuid := '58053c68-8399-418a-a728-65fd920b6050';
BEGIN
  IF EXISTS (SELECT 1 FROM public.psychologist_profiles WHERE id = _old)
     AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = _old)
     AND EXISTS (SELECT 1 FROM auth.users WHERE id = _new)
     AND NOT EXISTS (SELECT 1 FROM public.psychologist_profiles WHERE id = _new)
  THEN
    UPDATE public.psychologist_profiles SET id = _new WHERE id = _old;
    UPDATE public.notifications SET user_id = _new WHERE user_id = _old;
    INSERT INTO public.user_roles (user_id, role) VALUES (_new, 'psychologist')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 4. No new orphans: a profile is an account. NOT VALID because unpublished
-- seed duplicates from before the re-creation still lack accounts.
ALTER TABLE public.psychologist_profiles
  DROP CONSTRAINT IF EXISTS psychologist_profiles_id_fkey;
ALTER TABLE public.psychologist_profiles
  ADD CONSTRAINT psychologist_profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
