-- Series: ordered playlists of live-class recordings.
--
-- A host groups recordings into a series (a workshop cycle, a theme, a
-- course's live sessions), orders them, classifies the series and publishes
-- it. A recording inside a published series becomes watchable by Academy
-- members (has_all_access), which is what participants consented to at
-- registration ("shared with participants and Academy members"); until
-- then only the class's registered participants and its host can see it.

CREATE TABLE IF NOT EXISTS public.live_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_fr text,
  title_ar text,
  description text,
  description_fr text,
  description_ar text,
  host_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  category text,
  audience text,
  language text NOT NULL DEFAULT 'fr' CHECK (language IN ('fr', 'en', 'ar')),
  tags text[] NOT NULL DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.live_series_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid NOT NULL REFERENCES public.live_series(id) ON DELETE CASCADE,
  recording_id uuid NOT NULL REFERENCES public.live_class_recordings(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  -- Optional per-series label ("Session 3: exposure"), else the recording's title.
  label text,
  label_fr text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (series_id, recording_id)
);
CREATE INDEX IF NOT EXISTS live_series_items_order_idx ON public.live_series_items (series_id, position);

ALTER TABLE public.live_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_series_items ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.manages_live_series(_series uuid, _uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_uid, 'admin')
      OR EXISTS (SELECT 1 FROM public.live_series s WHERE s.id = _series AND s.host_id = _uid);
$$;

-- Series: published ones are public; hosts manage their own, admins all.
DROP POLICY IF EXISTS live_series_read ON public.live_series;
CREATE POLICY live_series_read ON public.live_series FOR SELECT
  USING (is_published OR host_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS live_series_insert ON public.live_series;
CREATE POLICY live_series_insert ON public.live_series FOR INSERT TO authenticated
  WITH CHECK (public.can_host_live_classes(auth.uid())
              AND (host_id = auth.uid() OR public.has_role(auth.uid(), 'admin')));
DROP POLICY IF EXISTS live_series_update ON public.live_series;
CREATE POLICY live_series_update ON public.live_series FOR UPDATE TO authenticated
  USING (public.manages_live_series(id, auth.uid()))
  WITH CHECK (host_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS live_series_delete ON public.live_series;
CREATE POLICY live_series_delete ON public.live_series FOR DELETE TO authenticated
  USING (public.manages_live_series(id, auth.uid()));

-- Items: readable with the series; a host may only file recordings of
-- classes they manage into series they manage.
DROP POLICY IF EXISTS live_series_items_read ON public.live_series_items;
CREATE POLICY live_series_items_read ON public.live_series_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.live_series s WHERE s.id = series_id
                 AND (s.is_published OR public.manages_live_series(s.id, auth.uid()))));
DROP POLICY IF EXISTS live_series_items_write ON public.live_series_items;
CREATE POLICY live_series_items_write ON public.live_series_items FOR INSERT TO authenticated
  WITH CHECK (public.manages_live_series(series_id, auth.uid())
              AND EXISTS (SELECT 1 FROM public.live_class_recordings r
                          WHERE r.id = recording_id
                            AND public.manages_live_class(r.class_id, auth.uid())));
DROP POLICY IF EXISTS live_series_items_update ON public.live_series_items;
CREATE POLICY live_series_items_update ON public.live_series_items FOR UPDATE TO authenticated
  USING (public.manages_live_series(series_id, auth.uid()))
  WITH CHECK (public.manages_live_series(series_id, auth.uid()));
DROP POLICY IF EXISTS live_series_items_delete ON public.live_series_items;
CREATE POLICY live_series_items_delete ON public.live_series_items FOR DELETE TO authenticated
  USING (public.manages_live_series(series_id, auth.uid()));

GRANT SELECT ON public.live_series, public.live_series_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_series TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_series_items TO authenticated;

CREATE OR REPLACE FUNCTION public.live_series_touch()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.host_id IS DISTINCT FROM OLD.host_id AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'only an admin can change the host';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS live_series_touch ON public.live_series;
CREATE TRIGGER live_series_touch BEFORE UPDATE ON public.live_series
  FOR EACH ROW EXECUTE FUNCTION public.live_series_touch();

-- A published, stored recording in a published series is open to Academy
-- members, on top of the class's participants and host.
CREATE OR REPLACE FUNCTION public.recording_in_published_series(_recording uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.live_series_items i
    JOIN public.live_series s ON s.id = i.series_id
    WHERE i.recording_id = _recording AND s.is_published);
$$;

DROP POLICY IF EXISTS live_rec_read ON public.live_class_recordings;
CREATE POLICY live_rec_read ON public.live_class_recordings FOR SELECT TO authenticated
  USING (public.manages_live_class(class_id, auth.uid())
         OR (is_published AND status = 'stored' AND (
               EXISTS (SELECT 1 FROM public.live_class_registrations r
                       WHERE r.class_id = live_class_recordings.class_id
                         AND r.user_id = auth.uid() AND r.cancelled_at IS NULL)
               OR (public.recording_in_published_series(id) AND public.has_all_access(auth.uid())))));

-- Reorder in one call: the ids in their new order; anything not listed keeps
-- its place after them.
CREATE OR REPLACE FUNCTION public.reorder_live_series(_series uuid, _item_ids uuid[])
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.manages_live_series(_series, auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  UPDATE public.live_series_items i SET position = x.ord
  FROM unnest(_item_ids) WITH ORDINALITY AS x(id, ord)
  WHERE i.id = x.id AND i.series_id = _series;
END $$;

REVOKE ALL ON FUNCTION public.manages_live_series(uuid, uuid),
  public.recording_in_published_series(uuid), public.reorder_live_series(uuid, uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.manages_live_series(uuid, uuid),
  public.recording_in_published_series(uuid), public.reorder_live_series(uuid, uuid[]) TO authenticated;
