-- Academy modules from live-class recordings.
--
-- A course module can carry a class recording as its video. The file stays in
-- the private "live-recordings" bucket; the live-class function signs a URL
-- only for someone who can read the module (and, for an Academy course, has
-- Academy access or the module is a free preview).
--
-- An admin turns a whole series into a draft course in one call: one module
-- per recording, in the series order. The course starts unpublished so its
-- lessons can be written and reviewed first.

ALTER TABLE public.course_modules
  ADD COLUMN IF NOT EXISTS recording_id uuid
    REFERENCES public.live_class_recordings(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS course_modules_recording_idx
  ON public.course_modules (recording_id) WHERE recording_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.course_from_live_series(_series uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s public.live_series;
  _course uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  SELECT * INTO s FROM public.live_series WHERE id = _series;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'series not found';
  END IF;
  IF s.course_id IS NOT NULL THEN
    RETURN s.course_id;
  END IF;

  INSERT INTO public.courses (title, title_fr, title_ar, description, description_fr,
                              description_ar, category, slug, is_published,
                              is_academy_premium, learning_path)
  VALUES (coalesce(s.title, s.title_fr), s.title_fr, s.title_ar,
          s.description, s.description_fr, s.description_ar,
          coalesce(s.category, 'general'),
          'live-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10),
          false, true, 'clinical-cpd')
  RETURNING id INTO _course;

  INSERT INTO public.course_modules (course_id, title, title_fr, title_ar, recording_id, order_index)
  SELECT _course,
         coalesce(i.label, r.title, r.title_fr, 'Session ' || row_number() OVER (ORDER BY i.position, i.created_at)),
         coalesce(i.label_fr, r.title_fr),
         r.title_ar,
         r.id,
         row_number() OVER (ORDER BY i.position, i.created_at)
  FROM public.live_series_items i
  JOIN public.live_class_recordings r ON r.id = i.recording_id
  WHERE i.series_id = _series;

  UPDATE public.live_series SET course_id = _course WHERE id = _series;
  RETURN _course;
END $$;

REVOKE ALL ON FUNCTION public.course_from_live_series(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.course_from_live_series(uuid) TO authenticated;
