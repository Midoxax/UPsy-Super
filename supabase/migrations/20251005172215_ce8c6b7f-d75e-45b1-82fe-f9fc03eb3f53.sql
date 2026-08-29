-- Fix 1: Add SELECT policy to client_matching_requests (CRITICAL)
-- Prevents unauthorized access to sensitive client mental health data
CREATE POLICY "Admins can view matching requests"
ON client_matching_requests
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Add SELECT policy to leads table (HIGH)
-- Enables admin oversight for quality assurance and support
CREATE POLICY "Admins can view all leads"
ON leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 3: Add write policies to subscriptions table (MEDIUM)
-- Restricts subscription modifications to admins only (defense-in-depth)
CREATE POLICY "Admins can create subscriptions"
ON subscriptions
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update subscriptions"
ON subscriptions
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete subscriptions"
ON subscriptions
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));