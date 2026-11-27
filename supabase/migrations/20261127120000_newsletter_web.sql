-- The newsletter on the site and its one-click vote.
--
-- Sent issues are public (their articles already are): the newsletter page
-- shows the latest issue and the archive, and each email links to its web
-- version. Only the published content is exposed, never the send counters.
--
-- Each issue asks readers which topic they want next month; a click on a
-- topic in the email records one vote per reader (newsletter-vote function,
-- keyed on the reader's unsubscribe token), and admins see the tally.

CREATE OR REPLACE FUNCTION public.newsletter_archive(_limit integer DEFAULT 24)
RETURNS TABLE (period text, intro_fr text, intro_en text, items jsonb, sent_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT i.period, i.intro_fr, i.intro_en, i.items, i.sent_at
    FROM public.newsletter_issues i
   WHERE i.status = 'sent'
   ORDER BY i.period DESC
   LIMIT least(greatest(coalesce(_limit, 24), 1), 120);
$$;
REVOKE ALL ON FUNCTION public.newsletter_archive(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.newsletter_archive(integer) TO anon, authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.newsletter_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period text NOT NULL CHECK (period ~ '^[0-9]{4}-[0-9]{2}$'),
  email text NOT NULL CHECK (email = lower(email)),
  topic text NOT NULL CHECK (topic IN ('stress', 'sleep', 'performance', 'relationships', 'parenting', 'work')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (period, email)
);
ALTER TABLE public.newsletter_votes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.newsletter_votes FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.newsletter_votes TO authenticated;
GRANT ALL ON public.newsletter_votes TO service_role;
DROP POLICY IF EXISTS "Admins read newsletter votes" ON public.newsletter_votes;
CREATE POLICY "Admins read newsletter votes" ON public.newsletter_votes
  FOR SELECT TO authenticated
  USING ((SELECT public.has_role((SELECT auth.uid()), 'admin')));

-- The tally for an issue (admins), without who voted.
CREATE OR REPLACE FUNCTION public.newsletter_vote_tally(_period text)
RETURNS TABLE (topic text, votes integer)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY SELECT v.topic, count(*)::int FROM public.newsletter_votes v
   WHERE v.period = _period GROUP BY v.topic ORDER BY 2 DESC;
END $$;
REVOKE ALL ON FUNCTION public.newsletter_vote_tally(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.newsletter_vote_tally(text) TO authenticated;
