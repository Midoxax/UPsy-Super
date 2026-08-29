-- Create proposal_requests table
CREATE TABLE public.proposal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization_size TEXT,
  service_interest TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.proposal_requests ENABLE ROW LEVEL SECURITY;

-- Admins can view all proposals
CREATE POLICY "Admins can view all proposals"
ON public.proposal_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update proposals
CREATE POLICY "Admins can update proposals"
ON public.proposal_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can submit a proposal request
CREATE POLICY "Anyone can submit proposal requests"
ON public.proposal_requests
FOR INSERT
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_proposal_requests_updated_at
BEFORE UPDATE ON public.proposal_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();