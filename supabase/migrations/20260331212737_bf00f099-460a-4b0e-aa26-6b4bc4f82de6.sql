
-- Drop existing policies that may already exist from previous partial migration
DROP POLICY IF EXISTS "Admins can select all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Recreate clean admin-only policies on user_roles
CREATE POLICY "Admins can select all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix reviews: drop blanket anon SELECT
DROP POLICY IF EXISTS "Public can view ratings only" ON public.reviews;
DROP POLICY IF EXISTS "Public can view review ratings" ON public.reviews;

-- Create safe view for public rating data (no client identity)
CREATE OR REPLACE VIEW public.public_review_ratings AS
SELECT psychologist_id, rating, created_at FROM public.reviews;
GRANT SELECT ON public.public_review_ratings TO anon;
GRANT SELECT ON public.public_review_ratings TO authenticated;

-- Storage RLS
DROP POLICY IF EXISTS "Only admins can upload to storage" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can update storage objects" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can delete storage objects" ON storage.objects;
DROP POLICY IF EXISTS "Public can read public bucket objects" ON storage.objects;

CREATE POLICY "Only admins can upload to storage"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update storage objects"
ON storage.objects FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete storage objects"
ON storage.objects FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can read public bucket objects"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'email-assets');

-- Sessions: add WITH CHECK to client update
DROP POLICY IF EXISTS "Clients can update own sessions" ON public.sessions;
CREATE POLICY "Clients can update own sessions"
ON public.sessions FOR UPDATE TO public
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

-- Applications: restrict insert fields
DROP POLICY IF EXISTS "Public can submit applications" ON public.psychologist_applications;
CREATE POLICY "Public can submit applications"
ON public.psychologist_applications FOR INSERT TO anon, authenticated
WITH CHECK (status = 'pending' AND reviewed_at IS NULL AND reviewed_by IS NULL);

-- Leads: restrict insert status
DROP POLICY IF EXISTS "Anyone can submit leads" ON public.leads;
CREATE POLICY "Anyone can submit leads"
ON public.leads FOR INSERT TO public
WITH CHECK (status = 'new');

-- Proposals: restrict insert status
DROP POLICY IF EXISTS "Anyone can submit proposal requests" ON public.proposal_requests;
CREATE POLICY "Anyone can submit proposal requests"
ON public.proposal_requests FOR INSERT TO public
WITH CHECK (status = 'pending');
