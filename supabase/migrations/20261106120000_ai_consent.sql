-- Explicit consent before AI features process health data.
--
-- Journal reflections, session summaries, specialist briefs and the AI
-- assistant send text to a language-model provider in the United States.
-- Law 09-08 (art. 44) allows that transfer of sensitive data on the person's
-- express consent, so it is asked for separately, before first use, and can
-- be withdrawn at any time. The edge functions check it server-side: for a
-- specialist tool, the consent that counts is the client's, not the
-- specialist's.
ALTER TABLE public.privacy_preferences
  ADD COLUMN IF NOT EXISTS ai_consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS ai_consent_version text;

COMMENT ON COLUMN public.privacy_preferences.ai_consent_at IS
  'When the user agreed to AI processing of their data; null = not agreed or withdrawn.';

-- True when the user agreed and has not restricted processing. Service role
-- only: callers must not probe another user's choices.
CREATE OR REPLACE FUNCTION public.has_ai_consent(_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.privacy_preferences
    WHERE user_id = _user
      AND ai_consent_at IS NOT NULL
      AND NOT processing_restricted
  );
$$;

REVOKE ALL ON FUNCTION public.has_ai_consent(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_ai_consent(uuid) TO service_role;

-- Every grant and withdrawal is kept in the audit log.
CREATE OR REPLACE FUNCTION public.audit_ai_consent()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.ai_consent_at IS NULL THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.ai_consent_at IS NOT DISTINCT FROM OLD.ai_consent_at THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, metadata)
  VALUES (
    NEW.user_id,
    CASE WHEN NEW.ai_consent_at IS NULL THEN 'ai_consent_withdrawn' ELSE 'ai_consent_given' END,
    'privacy_preferences',
    NEW.user_id,
    jsonb_build_object('version', NEW.ai_consent_version)
  );
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.audit_ai_consent() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_audit_ai_consent ON public.privacy_preferences;
CREATE TRIGGER trg_audit_ai_consent
  AFTER INSERT OR UPDATE OF ai_consent_at ON public.privacy_preferences
  FOR EACH ROW EXECUTE FUNCTION public.audit_ai_consent();
