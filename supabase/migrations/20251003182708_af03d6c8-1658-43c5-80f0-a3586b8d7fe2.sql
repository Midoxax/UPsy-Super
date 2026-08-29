-- Create client_matching_requests table
CREATE TABLE public.client_matching_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  specialty_needed uuid REFERENCES public.specialties(id) NOT NULL,
  languages_preferred uuid[] NOT NULL DEFAULT '{}',
  budget_max numeric,
  location_city text,
  prefers_online boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_matching_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow anyone to insert requests
CREATE POLICY "Anyone can submit matching requests"
ON public.client_matching_requests FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_matching_requests_updated_at
  BEFORE UPDATE ON public.client_matching_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();