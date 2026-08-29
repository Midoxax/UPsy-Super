
-- Enums
CREATE TYPE public.ops_member_role AS ENUM ('director', 'operator', 'viewer');
CREATE TYPE public.ops_event_status AS ENUM ('draft', 'planning', 'active', 'completed', 'archived');
CREATE TYPE public.ops_task_state AS ENUM ('pending', 'active', 'blocked', 'delayed', 'escalated', 'validated', 'completed', 'archived');

-- Workspaces
CREATE TABLE public.ops_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL DEFAULT 'institution',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ops_workspaces TO authenticated;
GRANT ALL ON public.ops_workspaces TO service_role;
ALTER TABLE public.ops_workspaces ENABLE ROW LEVEL SECURITY;

-- Members
CREATE TABLE public.ops_workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.ops_workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.ops_member_role NOT NULL DEFAULT 'operator',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ops_workspace_members TO authenticated;
GRANT ALL ON public.ops_workspace_members TO service_role;
ALTER TABLE public.ops_workspace_members ENABLE ROW LEVEL SECURITY;

-- Security definer helpers (avoid recursive RLS)
CREATE OR REPLACE FUNCTION public.ops_has_workspace_access(_user UUID, _workspace UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ops_workspace_members
    WHERE user_id = _user AND workspace_id = _workspace
  );
$$;

CREATE OR REPLACE FUNCTION public.ops_workspace_role(_user UUID, _workspace UUID)
RETURNS public.ops_member_role LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.ops_workspace_members
  WHERE user_id = _user AND workspace_id = _workspace
  LIMIT 1;
$$;

-- Events
CREATE TABLE public.ops_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.ops_workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL,
  intake JSONB NOT NULL DEFAULT '{}'::jsonb,
  status public.ops_event_status NOT NULL DEFAULT 'draft',
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ops_events_workspace ON public.ops_events(workspace_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ops_events TO authenticated;
GRANT ALL ON public.ops_events TO service_role;
ALTER TABLE public.ops_events ENABLE ROW LEVEL SECURITY;

-- Protocol phases
CREATE TABLE public.ops_protocol_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.ops_events(id) ON DELETE CASCADE,
  order_index INT NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ops_phases_event ON public.ops_protocol_phases(event_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ops_protocol_phases TO authenticated;
GRANT ALL ON public.ops_protocol_phases TO service_role;
ALTER TABLE public.ops_protocol_phases ENABLE ROW LEVEL SECURITY;

-- Tasks
CREATE TABLE public.ops_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.ops_events(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES public.ops_protocol_phases(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  owner_user_id UUID,
  owner_role TEXT,
  state public.ops_task_state NOT NULL DEFAULT 'pending',
  deadline TIMESTAMPTZ,
  dependencies UUID[] NOT NULL DEFAULT '{}',
  proof_required BOOLEAN NOT NULL DEFAULT false,
  proof_url TEXT,
  escalation JSONB NOT NULL DEFAULT '{}'::jsonb,
  psych_safety_flag BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ops_tasks_event ON public.ops_tasks(event_id);
CREATE INDEX idx_ops_tasks_state ON public.ops_tasks(state);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ops_tasks TO authenticated;
GRANT ALL ON public.ops_tasks TO service_role;
ALTER TABLE public.ops_tasks ENABLE ROW LEVEL SECURITY;

-- Task state log
CREATE TABLE public.ops_task_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.ops_tasks(id) ON DELETE CASCADE,
  actor_user_id UUID,
  from_state public.ops_task_state,
  to_state public.ops_task_state NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ops_task_events_task ON public.ops_task_events(task_id);
GRANT SELECT, INSERT ON public.ops_task_events TO authenticated;
GRANT ALL ON public.ops_task_events TO service_role;
ALTER TABLE public.ops_task_events ENABLE ROW LEVEL SECURITY;

-- Director threads
CREATE TABLE public.ops_director_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.ops_workspaces(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.ops_events(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New thread',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ops_director_threads TO authenticated;
GRANT ALL ON public.ops_director_threads TO service_role;
ALTER TABLE public.ops_director_threads ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.ops_director_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.ops_director_threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ops_director_messages_thread ON public.ops_director_messages(thread_id);
GRANT SELECT, INSERT ON public.ops_director_messages TO authenticated;
GRANT ALL ON public.ops_director_messages TO service_role;
ALTER TABLE public.ops_director_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "members can view their workspaces" ON public.ops_workspaces FOR SELECT TO authenticated
  USING (public.ops_has_workspace_access(auth.uid(), id));
CREATE POLICY "users can create workspaces" ON public.ops_workspaces FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "directors can update workspaces" ON public.ops_workspaces FOR UPDATE TO authenticated
  USING (public.ops_workspace_role(auth.uid(), id) = 'director');

CREATE POLICY "members can view their membership rows" ON public.ops_workspace_members FOR SELECT TO authenticated
  USING (public.ops_has_workspace_access(auth.uid(), workspace_id));
CREATE POLICY "directors manage members" ON public.ops_workspace_members FOR ALL TO authenticated
  USING (public.ops_workspace_role(auth.uid(), workspace_id) = 'director')
  WITH CHECK (public.ops_workspace_role(auth.uid(), workspace_id) = 'director');
CREATE POLICY "self insert membership" ON public.ops_workspace_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "members view events" ON public.ops_events FOR SELECT TO authenticated
  USING (public.ops_has_workspace_access(auth.uid(), workspace_id));
CREATE POLICY "operators+ create events" ON public.ops_events FOR INSERT TO authenticated
  WITH CHECK (public.ops_workspace_role(auth.uid(), workspace_id) IN ('director','operator') AND created_by = auth.uid());
CREATE POLICY "operators+ update events" ON public.ops_events FOR UPDATE TO authenticated
  USING (public.ops_workspace_role(auth.uid(), workspace_id) IN ('director','operator'));
CREATE POLICY "directors delete events" ON public.ops_events FOR DELETE TO authenticated
  USING (public.ops_workspace_role(auth.uid(), workspace_id) = 'director');

CREATE POLICY "members view phases" ON public.ops_protocol_phases FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ops_events e WHERE e.id = event_id AND public.ops_has_workspace_access(auth.uid(), e.workspace_id)));
CREATE POLICY "operators+ manage phases" ON public.ops_protocol_phases FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ops_events e WHERE e.id = event_id AND public.ops_workspace_role(auth.uid(), e.workspace_id) IN ('director','operator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.ops_events e WHERE e.id = event_id AND public.ops_workspace_role(auth.uid(), e.workspace_id) IN ('director','operator')));

CREATE POLICY "members view tasks" ON public.ops_tasks FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ops_events e WHERE e.id = event_id AND public.ops_has_workspace_access(auth.uid(), e.workspace_id)));
CREATE POLICY "operators+ manage tasks" ON public.ops_tasks FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ops_events e WHERE e.id = event_id AND public.ops_workspace_role(auth.uid(), e.workspace_id) IN ('director','operator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.ops_events e WHERE e.id = event_id AND public.ops_workspace_role(auth.uid(), e.workspace_id) IN ('director','operator')));

CREATE POLICY "members view task events" ON public.ops_task_events FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ops_tasks t JOIN public.ops_events e ON e.id = t.event_id WHERE t.id = task_id AND public.ops_has_workspace_access(auth.uid(), e.workspace_id)));
CREATE POLICY "members insert task events" ON public.ops_task_events FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.ops_tasks t JOIN public.ops_events e ON e.id = t.event_id WHERE t.id = task_id AND public.ops_workspace_role(auth.uid(), e.workspace_id) IN ('director','operator')));

CREATE POLICY "members view their director threads" ON public.ops_director_threads FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND public.ops_has_workspace_access(auth.uid(), workspace_id));
CREATE POLICY "members create director threads" ON public.ops_director_threads FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.ops_has_workspace_access(auth.uid(), workspace_id));
CREATE POLICY "members manage director threads" ON public.ops_director_threads FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "members delete director threads" ON public.ops_director_threads FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "members view director messages" ON public.ops_director_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ops_director_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()));
CREATE POLICY "members insert director messages" ON public.ops_director_messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.ops_director_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()));

-- Auto-add creator as director member
CREATE OR REPLACE FUNCTION public.ops_workspace_after_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.ops_workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'director')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_ops_workspace_after_insert
  AFTER INSERT ON public.ops_workspaces
  FOR EACH ROW EXECUTE FUNCTION public.ops_workspace_after_insert();

-- updated_at triggers (reuse existing update_updated_at_column if present, else inline)
CREATE OR REPLACE FUNCTION public.ops_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER trg_ops_workspaces_touch BEFORE UPDATE ON public.ops_workspaces FOR EACH ROW EXECUTE FUNCTION public.ops_touch_updated_at();
CREATE TRIGGER trg_ops_events_touch BEFORE UPDATE ON public.ops_events FOR EACH ROW EXECUTE FUNCTION public.ops_touch_updated_at();
CREATE TRIGGER trg_ops_tasks_touch BEFORE UPDATE ON public.ops_tasks FOR EACH ROW EXECUTE FUNCTION public.ops_touch_updated_at();

-- Task state-change auto log
CREATE OR REPLACE FUNCTION public.ops_log_task_state()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.state IS DISTINCT FROM OLD.state THEN
    INSERT INTO public.ops_task_events (task_id, actor_user_id, from_state, to_state)
    VALUES (NEW.id, auth.uid(), OLD.state, NEW.state);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_ops_task_state_log AFTER UPDATE ON public.ops_tasks FOR EACH ROW EXECUTE FUNCTION public.ops_log_task_state();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.ops_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ops_task_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ops_events;
