-- Create psychologist_applications table
CREATE TABLE public.psychologist_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  qualifications text,
  accreditation_number text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.psychologist_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can submit applications"
ON public.psychologist_applications FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view all applications"
ON public.psychologist_applications FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all applications"
ON public.psychologist_applications FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.psychologist_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();