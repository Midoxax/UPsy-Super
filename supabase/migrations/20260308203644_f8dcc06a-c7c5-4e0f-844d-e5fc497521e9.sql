
-- Sessions table for booking
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  psychologist_id uuid NOT NULL REFERENCES public.psychologist_profiles(id) ON DELETE CASCADE,
  date_time timestamp with time zone NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  status text NOT NULL DEFAULT 'pending',
  session_type text NOT NULL DEFAULT 'online',
  video_room_id text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Clients can view own sessions
CREATE POLICY "Clients can view own sessions" ON public.sessions
  FOR SELECT USING (auth.uid() = client_id);

-- Clients can insert sessions
CREATE POLICY "Clients can book sessions" ON public.sessions
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Clients can cancel own sessions (update status)
CREATE POLICY "Clients can update own sessions" ON public.sessions
  FOR UPDATE USING (auth.uid() = client_id);

-- Psychologists can view their sessions
CREATE POLICY "Psychologists can view own sessions" ON public.sessions
  FOR SELECT USING (auth.uid() = psychologist_id);

-- Psychologists can update their sessions (add notes, change status)
CREATE POLICY "Psychologists can update own sessions" ON public.sessions
  FOR UPDATE USING (auth.uid() = psychologist_id);

-- Admins can view all
CREATE POLICY "Admins can view all sessions" ON public.sessions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage all
CREATE POLICY "Admins can manage all sessions" ON public.sessions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
