-- Create leads table for client matching requests
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID REFERENCES public.psychologist_profiles(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  concerns TEXT NOT NULL,
  preferences TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create subscriptions table for psychologist billing
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID REFERENCES public.psychologist_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'basic', 'premium')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leads: Psychologists can only see and update their own leads
CREATE POLICY "Psychologists can view own leads"
ON public.leads FOR SELECT
TO authenticated
USING (auth.uid() = psychologist_id);

CREATE POLICY "Psychologists can update own leads"
ON public.leads FOR UPDATE
TO authenticated
USING (auth.uid() = psychologist_id);

-- RLS Policies for subscriptions: Psychologists can only view their own subscription
CREATE POLICY "Psychologists can view own subscription"
ON public.subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = psychologist_id);

-- Psychologists can insert their own profile
CREATE POLICY "Psychologists can insert own profile"
ON public.psychologist_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Psychologists can view their own profile (even if unpublished)
CREATE POLICY "Psychologists can view own profile"
ON public.psychologist_profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create triggers for updated_at
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();