-- Academy live classes: scheduling, registration with recording consent,
-- attendance, and a library of classified recordings.
--
-- Recording is for educational classes only. Clinical sessions (bookings)
-- keep recording, streaming and transcription off in jaas-token.
--
-- Writes that need checks (capacity, consent, attendance) go through
-- SECURITY DEFINER functions or the live-class edge function; the tables
-- themselves expose only what each role may read.

CREATE TABLE IF NOT EXISTS public.live_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_fr text,
  title_ar text,
  description text,
  description_fr text,
  description_ar text,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  host_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  starts_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60 CHECK (duration_minutes BETWEEN 15 AND 300),
  capacity integer CHECK (capacity IS NULL OR capacity > 0),
  language text NOT NULL DEFAULT 'fr' CHECK (language IN ('fr', 'en', 'ar')),
  recording_enabled boolean NOT NULL DEFAULT true,
  room_name text NOT NULL UNIQUE DEFAULT ('upsy-live-' || replace(gen_random_uuid()::text, '-', '')),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'ended')),
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS live_classes_starts_at_idx ON public.live_classes (starts_at);

CREATE TABLE IF NOT EXISTS public.live_class_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at timestamptz NOT NULL DEFAULT now(),
  -- Set when the participant agreed to the class being recorded.
  recording_consent_at timestamptz,
  cancelled_at timestamptz,
  UNIQUE (class_id, user_id)
);

-- One row per connection; last_seen_at advances with a heartbeat.
CREATE TABLE IF NOT EXISTS public.live_class_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  CHECK (last_seen_at >= joined_at)
);
CREATE INDEX IF NOT EXISTS live_class_attendance_class_idx ON public.live_class_attendance (class_id, user_id);

CREATE TABLE IF NOT EXISTS public.live_class_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  -- JaaS sends the same event more than once; the key makes it idempotent.
  source_key text UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'stored', 'failed')),
  storage_path text,
  size_bytes bigint,
  -- JaaS's download link lasts 24 hours; kept so an admin can retry in time.
  source_link text,
  source_expires_at timestamptz,
  error text,
  -- Classification
  title text,
  title_fr text,
  title_ar text,
  summary text,
  summary_fr text,
  category text,
  topic text,
  audience text,
  language text,
  tags text[] NOT NULL DEFAULT '{}',
  -- Visible to the class's participants (and Academy members) once published.
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS live_class_recordings_class_idx ON public.live_class_recordings (class_id);

ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_class_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_class_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_class_recordings ENABLE ROW LEVEL SECURITY;

-- Who may run classes: admins and verified specialists.
CREATE OR REPLACE FUNCTION public.can_host_live_classes(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_uid, 'admin') OR public.has_role(_uid, 'psychologist');
$$;

CREATE OR REPLACE FUNCTION public.manages_live_class(_class uuid, _uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_uid, 'admin')
      OR EXISTS (SELECT 1 FROM public.live_classes c WHERE c.id = _class AND c.host_id = _uid);
$$;

-- Classes: published ones are public; hosts and admins manage their own / all.
DROP POLICY IF EXISTS live_classes_read ON public.live_classes;
CREATE POLICY live_classes_read ON public.live_classes FOR SELECT
  USING (is_published OR host_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS live_classes_insert ON public.live_classes;
CREATE POLICY live_classes_insert ON public.live_classes FOR INSERT TO authenticated
  WITH CHECK (public.can_host_live_classes(auth.uid())
              AND (host_id = auth.uid() OR public.has_role(auth.uid(), 'admin')));
DROP POLICY IF EXISTS live_classes_update ON public.live_classes;
CREATE POLICY live_classes_update ON public.live_classes FOR UPDATE TO authenticated
  USING (public.manages_live_class(id, auth.uid()))
  WITH CHECK (host_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS live_classes_delete ON public.live_classes;
CREATE POLICY live_classes_delete ON public.live_classes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Registrations: each person sees their own; the host sees the class roster.
DROP POLICY IF EXISTS live_reg_read ON public.live_class_registrations;
CREATE POLICY live_reg_read ON public.live_class_registrations FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.manages_live_class(class_id, auth.uid()));

-- Attendance: participants see their own; hosts their class.
DROP POLICY IF EXISTS live_att_read ON public.live_class_attendance;
CREATE POLICY live_att_read ON public.live_class_attendance FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.manages_live_class(class_id, auth.uid()));

-- Recordings: hosts and admins manage; registered participants read published ones.
DROP POLICY IF EXISTS live_rec_read ON public.live_class_recordings;
CREATE POLICY live_rec_read ON public.live_class_recordings FOR SELECT TO authenticated
  USING (public.manages_live_class(class_id, auth.uid())
         OR (is_published AND status = 'stored' AND EXISTS (
               SELECT 1 FROM public.live_class_registrations r
               WHERE r.class_id = live_class_recordings.class_id
                 AND r.user_id = auth.uid() AND r.cancelled_at IS NULL)));
DROP POLICY IF EXISTS live_rec_update ON public.live_class_recordings;
CREATE POLICY live_rec_update ON public.live_class_recordings FOR UPDATE TO authenticated
  USING (public.manages_live_class(class_id, auth.uid()))
  WITH CHECK (public.manages_live_class(class_id, auth.uid()));
DROP POLICY IF EXISTS live_rec_delete ON public.live_class_recordings;
CREATE POLICY live_rec_delete ON public.live_class_recordings FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.live_classes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_classes TO authenticated;
GRANT SELECT ON public.live_class_registrations, public.live_class_attendance TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.live_class_recordings TO authenticated;

-- Host and room are fixed once created, except by an admin.
CREATE OR REPLACE FUNCTION public.live_classes_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.room_name IS DISTINCT FROM OLD.room_name THEN
    RAISE EXCEPTION 'room_name cannot change';
  END IF;
  IF NEW.host_id IS DISTINCT FROM OLD.host_id AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'only an admin can change the host';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS live_classes_guard ON public.live_classes;
CREATE TRIGGER live_classes_guard BEFORE UPDATE ON public.live_classes
  FOR EACH ROW EXECUTE FUNCTION public.live_classes_guard();

-- Storage, status and source fields belong to the webhook (service role).
CREATE OR REPLACE FUNCTION public.live_recordings_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' AND (
       NEW.class_id IS DISTINCT FROM OLD.class_id OR NEW.status IS DISTINCT FROM OLD.status
    OR NEW.storage_path IS DISTINCT FROM OLD.storage_path OR NEW.source_link IS DISTINCT FROM OLD.source_link
    OR NEW.source_key IS DISTINCT FROM OLD.source_key OR NEW.size_bytes IS DISTINCT FROM OLD.size_bytes) THEN
    RAISE EXCEPTION 'only classification fields can be edited';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS live_recordings_guard ON public.live_class_recordings;
CREATE TRIGGER live_recordings_guard BEFORE UPDATE ON public.live_class_recordings
  FOR EACH ROW EXECUTE FUNCTION public.live_recordings_guard();

-- Register (or re-register) for a published, upcoming class with room left.
-- A recorded class needs the participant's consent.
CREATE OR REPLACE FUNCTION public.register_live_class(_class uuid, _recording_consent boolean DEFAULT false)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  c public.live_classes;
  taken integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'sign in required'; END IF;
  SELECT * INTO c FROM public.live_classes WHERE id = _class FOR UPDATE;
  IF NOT FOUND OR NOT c.is_published OR c.status <> 'scheduled' THEN
    RETURN 'unavailable';
  END IF;
  IF c.starts_at + make_interval(mins => c.duration_minutes) < now() THEN
    RETURN 'past';
  END IF;
  IF c.recording_enabled AND NOT coalesce(_recording_consent, false) THEN
    RETURN 'consent_required';
  END IF;
  IF EXISTS (SELECT 1 FROM public.live_class_registrations
             WHERE class_id = _class AND user_id = auth.uid() AND cancelled_at IS NULL) THEN
    RETURN 'registered';
  END IF;
  IF c.capacity IS NOT NULL THEN
    SELECT count(*) INTO taken FROM public.live_class_registrations
      WHERE class_id = _class AND cancelled_at IS NULL;
    IF taken >= c.capacity THEN RETURN 'full'; END IF;
  END IF;
  INSERT INTO public.live_class_registrations (class_id, user_id, recording_consent_at)
  VALUES (_class, auth.uid(), CASE WHEN _recording_consent THEN now() END)
  ON CONFLICT (class_id, user_id) DO UPDATE
    SET cancelled_at = NULL, registered_at = now(),
        recording_consent_at = CASE WHEN _recording_consent THEN now() END;
  RETURN 'registered';
END $$;

CREATE OR REPLACE FUNCTION public.cancel_live_registration(_class uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.live_class_registrations SET cancelled_at = now()
  WHERE class_id = _class AND user_id = auth.uid() AND cancelled_at IS NULL;
$$;

-- Seats taken, for the public class page (no personal data).
CREATE OR REPLACE FUNCTION public.live_class_seats(_class uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*)::int FROM public.live_class_registrations
  WHERE class_id = _class AND cancelled_at IS NULL;
$$;

-- Roster for the host: who registered, consent, and minutes attended.
CREATE OR REPLACE FUNCTION public.live_class_roster(_class uuid)
RETURNS TABLE (user_id uuid, full_name text, email text, registered_at timestamptz,
               cancelled_at timestamptz, recording_consent_at timestamptz,
               minutes_attended integer, first_joined_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.manages_live_class(_class, auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY
  SELECT r.user_id, p.full_name, u.email::text, r.registered_at, r.cancelled_at,
         r.recording_consent_at,
         coalesce((SELECT round(sum(extract(epoch FROM a.last_seen_at - a.joined_at)) / 60)::int
                   FROM public.live_class_attendance a
                   WHERE a.class_id = _class AND a.user_id = r.user_id), 0),
         (SELECT min(a.joined_at) FROM public.live_class_attendance a
          WHERE a.class_id = _class AND a.user_id = r.user_id)
  FROM public.live_class_registrations r
  JOIN auth.users u ON u.id = r.user_id
  LEFT JOIN public.profiles p ON p.id = r.user_id
  WHERE r.class_id = _class
  ORDER BY r.registered_at;
END $$;

REVOKE ALL ON FUNCTION public.register_live_class(uuid, boolean), public.cancel_live_registration(uuid),
  public.live_class_roster(uuid), public.live_class_seats(uuid),
  public.can_host_live_classes(uuid), public.manages_live_class(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.register_live_class(uuid, boolean), public.cancel_live_registration(uuid),
  public.live_class_roster(uuid), public.live_class_seats(uuid),
  public.can_host_live_classes(uuid), public.manages_live_class(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.live_class_seats(uuid) TO anon;

-- Private bucket; files are served only through short-lived signed URLs
-- issued by the live-class edge function after an access check.
INSERT INTO storage.buckets (id, name, public)
VALUES ('live-recordings', 'live-recordings', false)
ON CONFLICT (id) DO UPDATE SET public = false;
