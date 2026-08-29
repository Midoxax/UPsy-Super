import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type OpsWorkspace = {
  id: string;
  name: string;
  slug: string;
  kind: string;
  created_at: string;
};

export type OpsEvent = {
  id: string;
  workspace_id: string;
  title: string;
  event_type: string;
  intake: Record<string, unknown>;
  status: "draft" | "planning" | "active" | "completed" | "archived";
  start_at: string | null;
  end_at: string | null;
  created_at: string;
};

export type OpsPhase = {
  id: string;
  event_id: string;
  order_index: number;
  title: string;
  description: string | null;
};

export type OpsTaskState =
  | "pending" | "active" | "blocked" | "delayed"
  | "escalated" | "validated" | "completed" | "archived";

export type OpsTask = {
  id: string;
  event_id: string;
  phase_id: string | null;
  title: string;
  description: string | null;
  owner_user_id: string | null;
  owner_role: string | null;
  state: OpsTaskState;
  deadline: string | null;
  dependencies: string[];
  proof_required: boolean;
  proof_url: string | null;
  escalation: Record<string, unknown>;
  psych_safety_flag: boolean;
  created_at: string;
  updated_at: string;
};

/** List workspaces user is a member of, plus the current one by slug. */
export function useOpsWorkspaces(slug?: string) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<OpsWorkspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("ops_workspaces" as any)
        .select("*")
        .order("created_at");
      if (active && data) setWorkspaces(data as unknown as OpsWorkspace[]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [user]);

  const current = workspaces.find(w => w.slug === slug) ?? workspaces[0];
  return { workspaces, current, loading };
}

/** Create a new workspace (caller becomes director automatically via trigger). */
export async function createWorkspace(name: string, slug: string, userId: string) {
  const { data, error } = await supabase
    .from("ops_workspaces" as any)
    .insert({ name, slug, created_by: userId })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as OpsWorkspace;
}

/** List events for a workspace. */
export function useOpsEvents(workspaceId?: string) {
  const [events, setEvents] = useState<OpsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) { setLoading(false); return; }
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("ops_events" as any)
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });
      if (active && data) setEvents(data as unknown as OpsEvent[]);
      setLoading(false);
    })();

    const channel = supabase
      .channel(`ops-events-${workspaceId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "ops_events", filter: `workspace_id=eq.${workspaceId}` }, async () => {
        const { data } = await supabase
          .from("ops_events" as any).select("*")
          .eq("workspace_id", workspaceId).order("created_at", { ascending: false });
        if (data) setEvents(data as unknown as OpsEvent[]);
      })
      .subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
  }, [workspaceId]);

  return { events, loading };
}

/** Get a single event with its phases and tasks, with realtime task updates. */
export function useOpsEvent(eventId?: string) {
  const [event, setEvent] = useState<OpsEvent | null>(null);
  const [phases, setPhases] = useState<OpsPhase[]>([]);
  const [tasks, setTasks] = useState<OpsTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) { setLoading(false); return; }
    let active = true;

    const refresh = async () => {
      const [{ data: e }, { data: p }, { data: t }] = await Promise.all([
        supabase.from("ops_events" as any).select("*").eq("id", eventId).single(),
        supabase.from("ops_protocol_phases" as any).select("*").eq("event_id", eventId).order("order_index"),
        supabase.from("ops_tasks" as any).select("*").eq("event_id", eventId).order("created_at"),
      ]);
      if (!active) return;
      if (e) setEvent(e as unknown as OpsEvent);
      if (p) setPhases(p as unknown as OpsPhase[]);
      if (t) setTasks(t as unknown as OpsTask[]);
      setLoading(false);
    };
    refresh();

    const channel = supabase
      .channel(`ops-event-${eventId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "ops_tasks", filter: `event_id=eq.${eventId}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "ops_protocol_phases", filter: `event_id=eq.${eventId}` }, refresh)
      .subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
  }, [eventId]);

  return { event, phases, tasks, loading };
}

/** All tasks across a workspace, realtime. */
export function useOpsWorkspaceTasks(workspaceId?: string) {
  const [tasks, setTasks] = useState<(OpsTask & { event_title?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) { setLoading(false); return; }
    let active = true;

    const refresh = async () => {
      const { data: events } = await supabase
        .from("ops_events" as any).select("id, title").eq("workspace_id", workspaceId);
      const ids = (events ?? []).map((e: any) => e.id);
      if (ids.length === 0) { if (active) { setTasks([]); setLoading(false); } return; }
      const { data } = await supabase
        .from("ops_tasks" as any).select("*")
        .in("event_id", ids)
        .order("deadline", { ascending: true, nullsFirst: false });
      if (!active) return;
      const titles = new Map((events ?? []).map((e: any) => [e.id, e.title as string]));
      setTasks(((data ?? []) as unknown as OpsTask[]).map(t => ({ ...t, event_title: titles.get(t.event_id) })));
      setLoading(false);
    };
    refresh();

    const channel = supabase
      .channel(`ops-ws-tasks-${workspaceId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "ops_tasks" }, refresh)
      .subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
  }, [workspaceId]);

  return { tasks, loading };
}

export async function updateTaskState(taskId: string, state: OpsTaskState) {
  const { error } = await supabase
    .from("ops_tasks" as any)
    .update({ state })
    .eq("id", taskId);
  if (error) throw error;
}