-- Trainings: programs that chain Academy courses into a path with a
-- certificate at the end (e.g. "Clinical foundations": anxiety → stress →
-- CBT → schema therapy).
--
-- A training owns no lessons: it orders existing courses. Access stays the
-- courses' own (free, Academy premium, or purchased), so a training adds no
-- second paywall. Progress is read from course_enrollments. When every
-- required course is complete, issue_training_certificate() writes the
-- certificate; the client cannot insert one itself for a training.
-- `cpd_hours` is what the certificate states as continuing education.

CREATE TABLE IF NOT EXISTS public.trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,80}$'),
  title text NOT NULL,
  title_fr text,
  title_ar text,
  description text,
  description_fr text,
  description_ar text,
  audience text NOT NULL DEFAULT 'public' CHECK (audience IN ('public', 'professional')),
  level text NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  cpd_hours numeric(5, 1) CHECK (cpd_hours IS NULL OR cpd_hours > 0),
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.training_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  required boolean NOT NULL DEFAULT true,
  UNIQUE (training_id, course_id)
);
CREATE INDEX IF NOT EXISTS training_courses_order_idx ON public.training_courses (training_id, position);

ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS trainings_read ON public.trainings;
CREATE POLICY trainings_read ON public.trainings FOR SELECT USING (is_published);
DROP POLICY IF EXISTS trainings_admin ON public.trainings;
CREATE POLICY trainings_admin ON public.trainings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS training_courses_read ON public.training_courses;
CREATE POLICY training_courses_read ON public.training_courses FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trainings t WHERE t.id = training_id AND t.is_published));
DROP POLICY IF EXISTS training_courses_admin ON public.training_courses;
CREATE POLICY training_courses_admin ON public.training_courses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.trainings TO anon;
GRANT SELECT ON public.training_courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trainings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_courses TO authenticated;

CREATE OR REPLACE FUNCTION public.trainings_touch() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;
DROP TRIGGER IF EXISTS trainings_touch ON public.trainings;
CREATE TRIGGER trainings_touch BEFORE UPDATE ON public.trainings
  FOR EACH ROW EXECUTE FUNCTION public.trainings_touch();

-- Users could insert any certificate for themselves, any type, any title
-- ("Professional Accreditation" included). Certificates are now written only
-- by checked server code: issue_training_certificate() below and the
-- generate-certificate function, which verifies completion first.
DROP POLICY IF EXISTS "Service can insert certificates" ON public.certificates;

-- A course counts as done when the learner has completed every one of its
-- modules (not just a stamped completed_at).
CREATE OR REPLACE FUNCTION public.course_done(_course uuid, _uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.course_enrollments e
    WHERE e.course_id = _course AND e.user_id = _uid
      AND EXISTS (SELECT 1 FROM public.course_modules m WHERE m.course_id = _course)
      AND NOT EXISTS (SELECT 1 FROM public.course_modules m
                      WHERE m.course_id = _course
                        AND NOT (m.id = ANY (coalesce(e.completed_modules, '{}')))));
$$;

-- Issue (or return) the caller's certificate for a training. Raises
-- 'incomplete' while a required course is unfinished.
CREATE OR REPLACE FUNCTION public.issue_training_certificate(_training uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  t public.trainings;
  _cert uuid;
  _name text;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not signed in'; END IF;
  SELECT * INTO t FROM public.trainings WHERE id = _training AND is_published;
  IF NOT FOUND THEN RAISE EXCEPTION 'not found'; END IF;

  SELECT id INTO _cert FROM public.certificates
  WHERE user_id = _uid AND certificate_type = 'mooc_training' AND reference_id = _training;
  IF _cert IS NOT NULL THEN RETURN _cert; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.training_courses WHERE training_id = _training AND required)
     OR EXISTS (SELECT 1 FROM public.training_courses tc
                WHERE tc.training_id = _training AND tc.required
                  AND NOT public.course_done(tc.course_id, _uid)) THEN
    RAISE EXCEPTION 'incomplete';
  END IF;

  SELECT coalesce(nullif(trim(p.full_name), ''), u.email) INTO _name
  FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id WHERE u.id = _uid;

  INSERT INTO public.certificates (user_id, certificate_type, title, description,
                                   recipient_name, reference_id, metadata)
  VALUES (_uid, 'mooc_training', coalesce(t.title_fr, t.title), coalesce(t.description_fr, t.description),
          coalesce(_name, 'U.Psy learner'), _training,
          jsonb_build_object('training_slug', t.slug, 'cpd_hours', t.cpd_hours,
            'courses', (SELECT jsonb_agg(c.title ORDER BY tc.position)
                        FROM public.training_courses tc JOIN public.courses c ON c.id = tc.course_id
                        WHERE tc.training_id = _training AND tc.required)))
  RETURNING id INTO _cert;
  RETURN _cert;
END $$;

REVOKE ALL ON FUNCTION public.course_done(uuid, uuid), public.issue_training_certificate(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.course_done(uuid, uuid), public.issue_training_certificate(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.course_done(uuid, uuid) TO service_role;

-- Two starting programs from the existing courses (editable in admin).
INSERT INTO public.trainings (slug, title, title_fr, title_ar, description, description_fr, audience, level, cpd_hours, is_published)
VALUES
  ('fondations-cliniques', 'Clinical foundations', 'Fondations cliniques', 'الأسس السريرية',
   'Anxiety, stress, resilience, then the core of CBT and schema therapy: a complete path for students and early-career clinicians.',
   'Anxiété, stress, résilience, puis le cœur de la TCC et de la thérapie des schémas : un parcours complet pour étudiants et jeunes praticiens.',
   'professional', 'intermediate', 12, true),
  ('performance-mentale', 'Mental performance', 'Performance mentale', 'الأداء الذهني',
   'Sport psychology, competition preparation, wellbeing at work and leadership: the mental-performance path for athletes, coaches and managers.',
   'Psychologie du sport, préparation à la compétition, santé mentale au travail et leadership : le parcours performance pour sportifs, coachs et managers.',
   'public', 'beginner', 8, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.training_courses (training_id, course_id, position)
SELECT t.id, c.id, v.pos
FROM (VALUES
  ('fondations-cliniques', 'understanding-anxiety-7adcee', 1),
  ('fondations-cliniques', 'stress-management-essentials-a0c0c6', 2),
  ('fondations-cliniques', 'mental-resilience-training-bedff3', 3),
  ('fondations-cliniques', 'tcc-les-fondamentaux', 4),
  ('fondations-cliniques', 'therapie-des-schemas-introduction', 5),
  ('performance-mentale', 'sport-psychology-fundamentals-756683', 1),
  ('performance-mentale', 'pre-competition-mental-preparation-5a2ebe', 2),
  ('performance-mentale', 'corporate-wellbeing-program-f5b30f', 3),
  ('performance-mentale', 'leadership-psychology-9aac9e', 4)) AS v(tslug, cslug, pos)
JOIN public.trainings t ON t.slug = v.tslug
JOIN public.courses c ON c.slug = v.cslug
ON CONFLICT (training_id, course_id) DO NOTHING;
