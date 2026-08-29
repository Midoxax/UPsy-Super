-- Create app_role enum type
CREATE TYPE public.app_role AS ENUM ('admin', 'psychologist', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to create admin user (for bootstrapping first admin)
CREATE OR REPLACE FUNCTION public.create_admin_user(_email text, _password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Create auth user
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
  VALUES (_email, crypt(_password, gen_salt('bf')), now())
  RETURNING id INTO _user_id;
  
  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin');
  
  RETURN json_build_object('user_id', _user_id, 'email', _email, 'role', 'admin');
END;
$$;

-- Auto-assign psychologist role on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_psychologist()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'psychologist')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_psychologist_profile_created
  AFTER INSERT ON public.psychologist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_psychologist();