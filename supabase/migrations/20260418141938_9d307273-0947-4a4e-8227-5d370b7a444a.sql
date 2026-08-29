
-- ============================================================
-- PHASE 2.1 — Harden RLS on sensitive tables
-- ============================================================

-- mood_entries: replace public-role ALL policy with authenticated-only owner + admin
DROP POLICY IF EXISTS "Users can manage own mood entries" ON public.mood_entries;

CREATE POLICY "Users manage own mood entries"
  ON public.mood_entries FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view mood entries"
  ON public.mood_entries FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ai_conversations: restrict to authenticated
DROP POLICY IF EXISTS "Users can manage own conversations" ON public.ai_conversations;

CREATE POLICY "Users manage own conversations"
  ON public.ai_conversations FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ai_messages: restrict to authenticated
DROP POLICY IF EXISTS "Users can manage own messages" ON public.ai_messages;

CREATE POLICY "Users manage own messages"
  ON public.ai_messages FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.ai_conversations c
    WHERE c.id = ai_messages.conversation_id AND c.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.ai_conversations c
    WHERE c.id = ai_messages.conversation_id AND c.user_id = auth.uid()
  ));

-- athlete_training_sessions: restrict to authenticated
DROP POLICY IF EXISTS "Athletes can manage own sessions" ON public.athlete_training_sessions;

CREATE POLICY "Athletes manage own training sessions"
  ON public.athlete_training_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = athlete_id)
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Admins view all training sessions"
  ON public.athlete_training_sessions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- client_matching_requests: explicit admin-only update/delete
CREATE POLICY "Admins update matching requests"
  ON public.client_matching_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete matching requests"
  ON public.client_matching_requests FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- PHASE 2.2 — Audit log for sensitive resources
-- ============================================================

CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_user ON public.audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_log_resource ON public.audit_log(resource_type, resource_id);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read audit log"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger function: log changes on sensitive tables
CREATE OR REPLACE FUNCTION public.log_sensitive_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_resource_id UUID;
  v_user_id UUID;
BEGIN
  v_resource_id := COALESCE(NEW.id, OLD.id);
  v_user_id := COALESCE(
    CASE TG_TABLE_NAME
      WHEN 'session_notes' THEN COALESCE(NEW.psychologist_id, OLD.psychologist_id)
      ELSE COALESCE(NEW.user_id, OLD.user_id)
    END,
    auth.uid()
  );

  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, metadata)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    v_resource_id,
    jsonb_build_object('owner_id', v_user_id)
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_mood_entries
  AFTER INSERT OR UPDATE OR DELETE ON public.mood_entries
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_change();

CREATE TRIGGER audit_assessment_results
  AFTER INSERT OR UPDATE OR DELETE ON public.assessment_results
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_change();

CREATE TRIGGER audit_session_notes
  AFTER INSERT OR UPDATE OR DELETE ON public.session_notes
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_change();

-- ============================================================
-- PHASE 2.4 — Encryption scaffolding for clinical notes
-- ============================================================

-- Add encrypted column (used by future encrypt-note / decrypt-note edge functions)
ALTER TABLE public.session_notes
  ADD COLUMN IF NOT EXISTS encrypted_content TEXT,
  ADD COLUMN IF NOT EXISTS encryption_key_id UUID;

-- Per-psychologist key registry. Actual key material lives in Supabase Vault,
-- referenced by vault_secret_id; this table just maps psychologist -> secret.
CREATE TABLE public.psychologist_encryption_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id UUID NOT NULL UNIQUE,
  vault_secret_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  rotated_at TIMESTAMPTZ
);

ALTER TABLE public.psychologist_encryption_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Psychologists view own key reference"
  ON public.psychologist_encryption_keys FOR SELECT
  TO authenticated
  USING (auth.uid() = psychologist_id);

CREATE POLICY "Admins manage encryption keys"
  ON public.psychologist_encryption_keys FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
