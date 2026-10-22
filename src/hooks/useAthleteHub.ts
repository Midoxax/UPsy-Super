import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Checkin = {
  id: string;
  user_id: string;
  mood: number;
  sleep: number;
  stress: number;
  energy: number;
  cognitive_load: number;
  score: number;
  note: string | null;
  created_at: string;
};

export type Protocol = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  duration_minutes: number;
  steps: Array<{ label: string }>;
  focus_areas: string[];
};

export type JournalEntry = {
  id: string;
  title: string | null;
  content: string;
  mood_tag: string | null;
  created_at: string;
  ai_summary?: string | null;
  themes?: string[] | null;
  synthesized_at?: string | null;
};

// Score = weighted blend on a 0-100 scale.
// stress + cognitive_load are inverted (lower = better readiness).
export type Goal = {
  id: string;
  title: string;
  kind: string;
  target_date: string | null;
  progress: number;
  status: string;
  created_at: string;
};

export type ChecklistItem = { label: string; done: boolean };

export type Competition = {
  id: string;
  name: string;
  event_date: string;
  location: string | null;
  importance: number;
  checklist: ChecklistItem[];
  result: string | null;
  performance_rating: number | null;
  reflection: string | null;
};

export type Completion = {
  id: string;
  protocol_id: string;
  completed_at: string;
  duration_minutes: number | null;
  rating: number | null;
};

export type AthleteAssessment = {
  id: string;
  title: string;
  description: string | null;
  question_count: number;
  estimated_minutes: number;
  last?: { total_score: number | null; completed_at: string | null };
};

export type Share = {
  id: string;
  psychologist_id: string;
  scopes: string[];
  revoked_at: string | null;
};

export function computeReadinessScore(d: {
  mood: number;
  sleep: number;
  stress: number;
  energy: number;
  cognitive_load: number;
}): number {
  const inv = (n: number) => 11 - n; // 1..10 -> 10..1
  const weighted =
    d.mood * 0.2 +
    d.sleep * 0.25 +
    inv(d.stress) * 0.2 +
    d.energy * 0.2 +
    inv(d.cognitive_load) * 0.15;
  return Math.max(0, Math.min(100, Math.round(weighted * 10)));
}

export function useAthleteHub() {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [assessments, setAssessments] = useState<AthleteAssessment[]>([]);
  const [shares, setShares] = useState<Share[]>([]);
  const [candidates, setCandidates] = useState<
    { psychologist_id: string; full_name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [cRes, pRes, jRes] = await Promise.all([
      user
        ? supabase
            .from("readiness_checkins")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            // 60 days covers the report's "vs previous 30 days" comparison.
            .limit(90)
        : Promise.resolve({ data: [], error: null } as any),
      supabase
        .from("athlete_protocols")
        .select("*")
        .eq("is_published", true)
        .order("duration_minutes"),
      user
        ? supabase
            .from("journal_entries")
            .select(
              "id,title,content,mood_tag,created_at,ai_summary,themes,synthesized_at",
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(40)
        : Promise.resolve({ data: [], error: null } as any),
    ]);
    if (cRes.data) setCheckins(cRes.data as Checkin[]);
    if (pRes.data) setProtocols(pRes.data as unknown as Protocol[]);
    if (jRes.data) setJournal(jRes.data as JournalEntry[]);
    if (user) await loadModules(user.id);
    setLoading(false);
  }, [user]);

  // Modules 5-8. Each read fails soft: a missing table on an older database
  // leaves that module empty instead of breaking the hub.
  const loadModules = async (uid: string) => {
    const since = new Date(Date.now() - 60 * 86400000).toISOString();
    const [gRes, compRes, doneRes, aRes, rRes, sRes, candRes] =
      await Promise.all([
        supabase
          .from("athlete_goals")
          .select("id,title,kind,target_date,progress,status,created_at")
          .eq("user_id", uid)
          .order("created_at", { ascending: false }),
        supabase
          .from("athlete_competitions")
          .select(
            "id,name,event_date,location,importance,checklist,result,performance_rating,reflection",
          )
          .eq("user_id", uid)
          .order("event_date", { ascending: true }),
        supabase
          .from("protocol_completions")
          .select("id,protocol_id,completed_at,duration_minutes,rating")
          .eq("user_id", uid)
          .gte("completed_at", since)
          .order("completed_at", { ascending: false }),
        supabase
          .from("assessments")
          .select("id,title,description,question_count,estimated_minutes")
          .eq("category", "athlete")
          .eq("is_published", true)
          .order("title"),
        supabase
          .from("assessment_results")
          .select("assessment_id,total_score,completed_at")
          .eq("user_id", uid)
          .order("completed_at", { ascending: false })
          .limit(50),
        supabase
          .from("athlete_shares")
          .select("id,psychologist_id,scopes,revoked_at")
          .eq("athlete_id", uid),
        supabase.rpc("athlete_share_candidates"),
      ]);
    setGoals((gRes.data as Goal[]) ?? []);
    setCompetitions((compRes.data as unknown as Competition[]) ?? []);
    setCompletions((doneRes.data as Completion[]) ?? []);
    const last = new Map<
      string,
      { total_score: number | null; completed_at: string | null }
    >();
    for (const r of rRes.data ?? [])
      if (!last.has(r.assessment_id)) last.set(r.assessment_id, r);
    setAssessments(
      ((aRes.data as AthleteAssessment[]) ?? []).map((a) => ({
        ...a,
        last: last.get(a.id),
      })),
    );
    setShares((sRes.data as Share[]) ?? []);
    setCandidates(candRes.data ?? []);
  };

  useEffect(() => {
    load();
  }, [load]);

  const submitCheckin = useCallback(
    async (input: {
      mood: number;
      sleep: number;
      stress: number;
      energy: number;
      cognitive_load: number;
      note?: string;
    }) => {
      if (!user) return { error: new Error("not signed in") };
      const score = computeReadinessScore(input);
      const { error } = await supabase
        .from("readiness_checkins")
        .insert({ ...input, user_id: user.id, score });
      if (!error) await load();
      return { error, score };
    },
    [user, load],
  );

  const logProtocol = useCallback(
    async (protocolId: string, durationMinutes: number, rating?: number) => {
      if (!user) return { error: new Error("not signed in") };
      const { error } = await supabase.from("protocol_completions").insert({
        user_id: user.id,
        protocol_id: protocolId,
        duration_minutes: durationMinutes,
        rating: rating ?? null,
      });
      if (!error) await loadModules(user.id);
      return { error };
    },
    [user],
  );

  // Generic write for the module tables, then a refresh of modules 5-8.
  const write = useCallback(
    async (run: () => PromiseLike<{ error: unknown }>) => {
      if (!user) return { error: new Error("not signed in") };
      const { error } = await run();
      if (!error) await loadModules(user.id);
      return { error: error as Error | null };
    },
    [user],
  );

  const addGoal = (g: { title: string; kind: string; target_date?: string }) =>
    write(() =>
      supabase.from("athlete_goals").insert({
        user_id: user!.id,
        title: g.title,
        kind: g.kind,
        target_date: g.target_date || null,
      }),
    );
  const updateGoal = (id: string, patch: Partial<Goal>) =>
    write(() => supabase.from("athlete_goals").update(patch).eq("id", id));

  const addCompetition = (c: {
    name: string;
    event_date: string;
    location?: string;
    importance: number;
    checklist: ChecklistItem[];
  }) =>
    write(() =>
      supabase.from("athlete_competitions").insert({
        user_id: user!.id,
        name: c.name,
        event_date: c.event_date,
        location: c.location || null,
        importance: c.importance,
        checklist: c.checklist,
      }),
    );
  const updateCompetition = (id: string, patch: Partial<Competition>) =>
    write(() =>
      supabase
        .from("athlete_competitions")
        .update(patch as never)
        .eq("id", id),
    );
  const removeCompetition = (id: string) =>
    write(() => supabase.from("athlete_competitions").delete().eq("id", id));

  const setShare = (psychologistId: string, scopes: string[] | null) =>
    write(() =>
      scopes === null
        ? supabase
            .from("athlete_shares")
            .update({ revoked_at: new Date().toISOString() })
            .eq("athlete_id", user!.id)
            .eq("psychologist_id", psychologistId)
        : supabase.from("athlete_shares").upsert(
            {
              athlete_id: user!.id,
              psychologist_id: psychologistId,
              scopes,
              revoked_at: null,
            },
            { onConflict: "athlete_id,psychologist_id" },
          ),
    );

  const addJournalEntry = useCallback(
    async (entry: { title?: string; content: string; mood_tag?: string }) => {
      if (!user) return { error: new Error("not signed in") };
      const { error } = await supabase
        .from("journal_entries")
        .insert({ ...entry, user_id: user.id });
      if (!error) await load();
      return { error };
    },
    [user, load],
  );

  const synthesizeEntry = useCallback(
    async (entryId: string) => {
      const { data, error } = await supabase.functions.invoke(
        "journal-synthesize",
        {
          body: { entry_id: entryId },
        },
      );
      if (!error) await load();
      return { error, data };
    },
    [load],
  );

  const latestScore = checkins[0]?.score ?? null;

  return {
    checkins,
    protocols,
    journal,
    goals,
    competitions,
    completions,
    assessments,
    shares,
    candidates,
    loading,
    latestScore,
    submitCheckin,
    logProtocol,
    addGoal,
    updateGoal,
    addCompetition,
    updateCompetition,
    removeCompetition,
    setShare,
    addJournalEntry,
    synthesizeEntry,
    reload: load,
  };
}
