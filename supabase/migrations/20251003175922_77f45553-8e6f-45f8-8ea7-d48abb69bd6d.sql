-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create specialties reference table
CREATE TABLE public.specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create languages reference table
CREATE TABLE public.languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create psychologist profiles table
CREATE TABLE public.psychologist_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  city TEXT,
  is_accredited BOOLEAN DEFAULT false,
  offers_online BOOLEAN DEFAULT false,
  offers_in_person BOOLEAN DEFAULT false,
  hourly_rate_mad NUMERIC,
  calendly_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create junction table for psychologist specialties
CREATE TABLE public.psychologist_specialties (
  psychologist_id UUID REFERENCES public.psychologist_profiles(id) ON DELETE CASCADE,
  specialty_id UUID REFERENCES public.specialties(id) ON DELETE CASCADE,
  PRIMARY KEY (psychologist_id, specialty_id)
);

-- Create junction table for psychologist languages
CREATE TABLE public.psychologist_languages (
  psychologist_id UUID REFERENCES public.psychologist_profiles(id) ON DELETE CASCADE,
  language_id UUID REFERENCES public.languages(id) ON DELETE CASCADE,
  PRIMARY KEY (psychologist_id, language_id)
);

-- Enable RLS on all tables
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychologist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychologist_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychologist_languages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read access
CREATE POLICY "Public can view specialties"
ON public.specialties FOR SELECT
TO public USING (true);

CREATE POLICY "Public can view languages"
ON public.languages FOR SELECT
TO public USING (true);

CREATE POLICY "Public can view published profiles"
ON public.psychologist_profiles FOR SELECT
TO public USING (is_published = true);

CREATE POLICY "Public can view published profile specialties"
ON public.psychologist_specialties FOR SELECT
TO public USING (
  EXISTS (
    SELECT 1 FROM public.psychologist_profiles
    WHERE id = psychologist_id AND is_published = true
  )
);

CREATE POLICY "Public can view published profile languages"
ON public.psychologist_languages FOR SELECT
TO public USING (
  EXISTS (
    SELECT 1 FROM public.psychologist_profiles
    WHERE id = psychologist_id AND is_published = true
  )
);

-- Psychologists can update their own profile
CREATE POLICY "Psychologists can update own profile"
ON public.psychologist_profiles FOR UPDATE
TO authenticated USING (auth.uid() = id);

CREATE POLICY "Psychologists can manage own specialties"
ON public.psychologist_specialties FOR ALL
TO authenticated USING (auth.uid() = psychologist_id);

CREATE POLICY "Psychologists can manage own languages"
ON public.psychologist_languages FOR ALL
TO authenticated USING (auth.uid() = psychologist_id);

-- Create trigger for updated_at
CREATE TRIGGER update_psychologist_profiles_updated_at
BEFORE UPDATE ON public.psychologist_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default specialties
INSERT INTO public.specialties (name) VALUES
  ('Clinical Psychology'),
  ('Sport Psychology'),
  ('Trauma Recovery'),
  ('Cognitive Behavioral Therapy (CBT)'),
  ('Schema Therapy'),
  ('Performance Coaching'),
  ('Anxiety & Depression'),
  ('Relationship Counseling'),
  ('Child & Adolescent Psychology'),
  ('Organizational Psychology');

-- Seed default languages
INSERT INTO public.languages (name) VALUES
  ('English'),
  ('French'),
  ('Arabic'),
  ('Berber'),
  ('Spanish'),
  ('German');