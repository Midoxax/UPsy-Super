-- Add RLS policies for admin access to client_matching_requests
CREATE POLICY "Admins can view all matching requests"
ON public.client_matching_requests FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to update psychologist profiles
CREATE POLICY "Admins can update all profiles"
ON public.psychologist_profiles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to view all psychologist profiles
CREATE POLICY "Admins can view all profiles"
ON public.psychologist_profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));