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
export function computeReadinessScore(d: {
  mood: number; sleep: number; stress: number; energy: number; cognitive_load: number;
}): number {
  const inv = (n: number) => 11 - n; // 1..10 -> 10..1
  const weighted =
    d.mood * 0.20 +
    d.sleep * 0.25 +
    inv(d.stress) * 0.20 +
    d.energy * 0.20 +
    inv(d.cognitive_load) * 0.15;
  return Math.max(0, Math.min(100, Math.round(weighted * 10)));
}

export function useAthleteHub() {
  const { user } = useAuth();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [cRes, pRes, jRes] = await Promise.all([
      user
        ? supabase.from("readiness_checkins").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30)
        : Promise.resolve({ data: [], error: null } as any),
      supabase.from("athlete_protocols").select("*").eq("is_published", true).order("duration_minutes"),
      user
        ? supabase.from("journal_entries").select("id,title,content,mood_tag,created_at,ai_summary,themes,synthesized_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10)
        : Promise.resolve({ data: [], error: null } as any),
    ]);
    if (cRes.data) setCheckins(cRes.data as Checkin[]);
    if (pRes.data) setProtocols(pRes.data as unknown as Protocol[]);
    if (jRes.data) setJournal(jRes.data as JournalEntry[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const submitCheckin = useCallback(async (input: {
    mood: number; sleep: number; stress: number; energy: number; cognitive_load: number; note?: string;
  }) => {
    if (!user) return { error: new Error("not signed in") };
    const score = computeReadinessScore(input);
    const { error } = await supabase.from("readiness_checkins").insert({ ...input, user_id: user.id, score });
    if (!error) await load();
    return { error, score };
  }, [user, load]);

  const logProtocol = useCallback(async (protocolId: string, durationMinutes: number) => {
    if (!user) return { error: new Error("not signed in") };
    const { error } = await supabase.from("protocol_completions").insert({
      user_id: user.id, protocol_id: protocolId, duration_minutes: durationMinutes,
    });
    return { error };
  }, [user]);

  const addJournalEntry = useCallback(async (entry: { title?: string; content: string; mood_tag?: string }) => {
    if (!user) return { error: new Error("not signed in") };
    const { error } = await supabase.from("journal_entries").insert({ ...entry, user_id: user.id });
    if (!error) await load();
    return { error };
  }, [user, load]);

  const synthesizeEntry = useCallback(async (entryId: string) => {
    const { data, error } = await supabase.functions.invoke("journal-synthesize", {
      body: { entry_id: entryId },
    });
    if (!error) await load();
    return { error, data };
  }, [load]);

  const latestScore = checkins[0]?.score ?? null;

  return { checkins, protocols, journal, loading, latestScore, submitCheckin, logProtocol, addJournalEntry, synthesizeEntry, reload: load };
}