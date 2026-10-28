import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { STUDY } from "@/lib/study/copy";
import {
  periodStart,
  instrument,
  score,
  type InstrumentId,
} from "@/lib/study/instruments";

export type Enrollment = {
  participant_code: string;
  consented_at: string;
  withdrawn_at: string | null;
};

export type StudyResponse = {
  instrument: InstrumentId;
  period_start: string;
  score: number;
  subscores: Record<string, number>;
  created_at: string;
};

export type Demographics = {
  birthYear: number;
  sex: string;
  sport: string;
  level: string;
};

export function useStudy() {
  const { user } = useAuth();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [responses, setResponses] = useState<StudyResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const [e, r] = await Promise.all([
      supabase
        .from("study_enrollments")
        .select("participant_code,consented_at,withdrawn_at")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("study_responses")
        .select("instrument,period_start,score,subscores,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);
    setEnrollment(e.data ?? null);
    setResponses((r.data ?? []) as StudyResponse[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const enroll = async (d: Demographics) => {
    const { error } = await supabase.rpc("study_enroll", {
      p_consent_version: STUDY.CONSENT_VERSION,
      p_birth_year: d.birthYear,
      p_sex: d.sex,
      p_sport: d.sport,
      p_level: d.level,
    });
    if (!error) await load();
    return { error };
  };

  /** Saves answers for the instrument's current window (re-answering replaces). */
  const submit = async (id: InstrumentId, answers: number[]) => {
    if (!user || !enrollment) return { error: new Error("not enrolled") };
    const s = score(id, answers);
    const { error } = await supabase.from("study_responses").upsert(
      {
        user_id: user.id,
        instrument: id,
        period_start: periodStart(
          enrollment.consented_at,
          instrument(id).everyDays,
        ),
        answers,
        score: s.score,
        subscores: s.subscores,
      },
      { onConflict: "user_id,instrument,period_start" },
    );
    if (!error) await load();
    return { error, scored: s };
  };

  const withdraw = async (deleteData: boolean) => {
    const { error } = await supabase.rpc("study_withdraw", {
      p_delete: deleteData,
    });
    if (!error) await load();
    return { error };
  };

  return { loading, enrollment, responses, enroll, submit, withdraw };
}
