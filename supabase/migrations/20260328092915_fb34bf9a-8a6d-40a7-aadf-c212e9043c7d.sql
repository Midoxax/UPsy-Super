-- 1. Fix user_roles: drop overly broad ALL policy, replace with specific ones
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Fix reviews: drop blanket public SELECT, replace with anon-scoped policy
DROP POLICY IF EXISTS "Public can view review ratings" ON public.reviews;

CREATE POLICY "Public can view ratings only"
ON public.reviews FOR SELECT
TO anon
USING (true);