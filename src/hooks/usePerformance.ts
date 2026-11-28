import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Quality } from "@/lib/performance/metrics";

export type Session = {
  id: string;
  session_date: string;
  kind: string;
  duration_minutes: number;
  rpe: number;
  load: number | null;
  note: string | null;
};

export type ProfileSnapshot = {
  id: string;
  created_at: string;
  qualities: Quality[];
  note: string | null;
};

export type SeasonPhase = {
  id: string;
  name: string;
  kind: string;
  starts_on: string;
  ends_on: string;
  focus: string | null;
};

/**
 * The Performance Center's own data (20261128090000_performance_center):
 * training sessions (90 days), profile snapshots and season phases. Reads
 * fail soft, so an older database shows empty panels instead of an error.
 */
export function usePerformance() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["performance", uid],
    enabled: !!uid,
    queryFn: async () => {
      const since = new Date(Date.now() - 120 * 86_400_000)
        .toISOString()
        .slice(0, 10);
      const [s, p, ph] = await Promise.all([
        supabase
          .from("athlete_sessions")
          .select("id,session_date,kind,duration_minutes,rpe,load,note")
          .eq("user_id", uid!)
          .gte("session_date", since)
          .order("session_date", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase
          .from("athlete_profile_snapshots")
          .select("id,created_at,qualities,note")
          .eq("user_id", uid!)
          .order("created_at", { ascending: false })
          .limit(12),
        supabase
          .from("athlete_season_phases")
          .select("id,name,kind,starts_on,ends_on,focus")
          .eq("user_id", uid!)
          .order("starts_on"),
      ]);
      return {
        sessions: (s.data ?? []) as Session[],
        profiles: (p.data ?? []) as unknown as ProfileSnapshot[],
        phases: (ph.data ?? []) as SeasonPhase[],
      };
    },
  });

  const refresh = () =>
    qc.invalidateQueries({ queryKey: ["performance", uid] });
  const run = async (op: PromiseLike<{ error: unknown }>) => {
    const { error } = await op;
    if (!error) await refresh();
    return { error: (error as Error | null) ?? null };
  };

  return {
    loading: isLoading,
    sessions: data?.sessions ?? [],
    profiles: data?.profiles ?? [],
    phases: data?.phases ?? [],
    addSession: (s: Omit<Session, "id" | "load">) =>
      run(supabase.from("athlete_sessions").insert({ ...s, user_id: uid! })),
    removeSession: (id: string) =>
      run(supabase.from("athlete_sessions").delete().eq("id", id)),
    saveProfile: (qualities: Quality[], note?: string) =>
      run(
        supabase.from("athlete_profile_snapshots").insert({
          user_id: uid!,
          qualities: qualities as never,
          note: note || null,
        }),
      ),
    addPhase: (p: Omit<SeasonPhase, "id">) =>
      run(
        supabase.from("athlete_season_phases").insert({ ...p, user_id: uid! }),
      ),
    removePhase: (id: string) =>
      run(supabase.from("athlete_season_phases").delete().eq("id", id)),
  };
}
