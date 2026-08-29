import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { logSensitiveAccess } from "@/lib/compliance/auditAccess";

export type AnamnesisSection =
  | "identity"
  | "presenting_complaint"
  | "history_personal"
  | "history_family"
  | "medical"
  | "lifestyle"
  | "risk_screening"
  | "goals"
  | "relationships"
  | "specialized_module"
  | "objectives_consent";

export interface AnamnesisData {
  id?: string;
  client_id: string;
  psychologist_id?: string | null;
  booking_id?: string | null;
  identity: Record<string, any>;
  presenting_complaint: Record<string, any>;
  history_personal: Record<string, any>;
  history_family: Record<string, any>;
  medical: Record<string, any>;
  lifestyle: Record<string, any>;
  risk_screening: Record<string, any>;
  goals: Record<string, any>;
  relationships: Record<string, any>;
  specialized_module: Record<string, any>;
  objectives_consent: Record<string, any>;
  status: "draft" | "in_progress" | "completed" | "reviewed";
  consent_given: boolean;
  consent_at?: string | null;
  completed_at?: string | null;
  reviewed_at?: string | null;
  phq9_score?: number | null;
  phq9_severity?: string | null;
  gad7_score?: number | null;
  gad7_severity?: string | null;
  pss10_score?: number | null;
  pss10_severity?: string | null;
  audit_c_score?: number | null;
  audit_c_at_risk?: boolean;
  clinical_flags?: string[];
  completion_pct?: number;
  current_section?: number;
  shared_with_psy_at?: string | null;
}

const empty = (clientId: string): AnamnesisData => ({
  client_id: clientId,
  identity: {},
  presenting_complaint: {},
  history_personal: {},
  history_family: {},
  medical: {},
  lifestyle: {},
  risk_screening: {},
  goals: {},
  relationships: {},
  specialized_module: {},
  objectives_consent: {},
  status: "draft",
  consent_given: false,
});

export const useAnamnesis = (clientId?: string, psychologistId?: string | null, bookingId?: string | null) => {
  const { user } = useAuth();
  const targetClient = clientId || user?.id;
  const [data, setData] = useState<AnamnesisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<number | null>(null);

  const load = useCallback(async () => {
    if (!targetClient) return;
    setLoading(true);
    const { data: rows } = await supabase
      .from("client_anamneses")
      .select("*")
      .eq("client_id", targetClient)
      .order("updated_at", { ascending: false })
      .limit(1);
    if (rows && rows.length > 0) {
      // Reading someone else's anamnesis is a C1 access event.
      if (user?.id && targetClient !== user.id) {
        void logSensitiveAccess({
          resourceType: "client_anamneses",
          recordRef: (rows[0] as any).id,
          dataClass: "C1",
          subjectId: targetClient,
          context: { view: "anamnesis" },
        });
      }
      setData(rows[0] as any);
    }
    else setData(empty(targetClient));
    setLoading(false);
  }, [targetClient]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (patch: Partial<AnamnesisData>) => {
    if (!targetClient) return null;
    setSaving(true);
    const merged: AnamnesisData = { ...(data || empty(targetClient)), ...patch };
    if (psychologistId && !merged.psychologist_id) merged.psychologist_id = psychologistId;
    if (bookingId && !merged.booking_id) merged.booking_id = bookingId;
    if (merged.status === "draft") merged.status = "in_progress";

    let result;
    if (merged.id) {
      const { id, ...rest } = merged;
      result = await supabase.from("client_anamneses").update(rest).eq("id", id).select().single();
    } else {
      const { id, ...rest } = merged as any;
      result = await supabase.from("client_anamneses").insert(rest).select().single();
    }
    setSaving(false);
    if (result.data) setData(result.data as any);
    return result;
  }, [data, targetClient, psychologistId, bookingId]);

  const autoSave = useCallback((patch: Partial<AnamnesisData>) => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => { save(patch); }, 800);
  }, [save]);

  const complete = useCallback(async () => {
    return save({ status: "completed", completed_at: new Date().toISOString() });
  }, [save]);

  const giveConsent = useCallback(async () => {
    return save({ consent_given: true, consent_at: new Date().toISOString() });
  }, [save]);

  const markReviewed = useCallback(async (notes?: string) => {
    const patch: Partial<AnamnesisData> = {
      status: "reviewed",
      reviewed_at: new Date().toISOString(),
    };
    if (notes && notes.trim()) {
      (patch as any).goals = { ...(data?.goals || {}), review_notes: notes.trim() };
    }
    return save(patch);
  }, [save, data]);

  const progress = (() => {
    if (!data) return 0;
    const sections: AnamnesisSection[] = [
      "identity", "presenting_complaint", "history_personal", "history_family",
      "medical", "lifestyle", "risk_screening", "goals",
    ];
    const filled = sections.filter((s) => Object.keys(data[s] || {}).length > 0).length;
    return Math.round((filled / sections.length) * 100);
  })();

  return { data, loading, saving, save, autoSave, complete, giveConsent, markReviewed, reload: load, progress };
};