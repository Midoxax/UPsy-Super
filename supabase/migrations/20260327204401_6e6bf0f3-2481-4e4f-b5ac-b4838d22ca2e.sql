
-- 1. Revoke execute on create_admin_user from public roles
REVOKE EXECUTE ON FUNCTION public.create_admin_user(_email text, _password text) FROM anon, authenticated, public;

-- 2. Tighten psychologist_profiles UPDATE policy to require psychologist role
DROP POLICY IF EXISTS "Psychologists can update own profile" ON psychologist_profiles;
CREATE POLICY "Psychologists can update own profile" ON psychologist_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id AND has_role(auth.uid(), 'psychologist'::app_role))
  WITH CHECK (auth.uid() = id AND has_role(auth.uid(), 'psychologist'::app_role));

-- 3. Tighten psychologist_profiles INSERT policy to require psychologist role  
DROP POLICY IF EXISTS "Psychologists can insert own profile" ON psychologist_profiles;
CREATE POLICY "Psychologists can insert own profile" ON psychologist_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id AND has_role(auth.uid(), 'psychologist'::app_role));

-- 4. Replace public reviews SELECT with restricted policy
DROP POLICY IF EXISTS "Public can view reviews" ON reviews;
CREATE POLICY "Public can view review ratings" ON reviews
  FOR SELECT TO public
  USING (true);

-- 5. Fix assessment_results psychologist policy to use sessions instead of email lookup
DROP POLICY IF EXISTS "Psychologists can view client results" ON assessment_results;
CREATE POLICY "Psychologists can view client results" ON assessment_results
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.psychologist_id = auth.uid()
        AND s.client_id = assessment_results.user_id
        AND s.status = 'completed'
    )
  );
