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

type WriteResult = {
  data: AnamnesisData | null;
  error: { message: string } | null;
};

export const useAnamnesis = (
  clientId?: string,
  psychologistId?: string | null,
  bookingId?: string | null,
) => {
  const { user } = useAuth();
  const targetClient = clientId || user?.id;
  const [data, setDataState] = useState<AnamnesisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveTimer = useRef<number | null>(null);
  // Latest row as known to the client; writes merge onto this, never onto a
  // render-time snapshot.
  const dataRef = useRef<AnamnesisData | null>(null);
  // Patches queued by autoSave and not yet written, merged per section.
  const pendingRef = useRef<Partial<AnamnesisData>>({});
  // Every write is chained on this promise so the first INSERT finishes (and
  // gives us an id) before any later write runs.
  const chainRef = useRef<Promise<unknown>>(Promise.resolve());
  const psyRef = useRef(psychologistId);
  const bookingRef = useRef(bookingId);
  psyRef.current = psychologistId;
  bookingRef.current = bookingId;

  const setData = useCallback((next: AnamnesisData | null) => {
    dataRef.current = next;
    setDataState(next);
  }, []);

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
    } else setData(empty(targetClient));
    setLoading(false);
  }, [targetClient, setData]);

  useEffect(() => {
    load();
  }, [load]);

  const write = useCallback(
    async (patch: Partial<AnamnesisData>): Promise<WriteResult> => {
      if (!targetClient)
        return { data: null, error: new Error("No client for anamnesis") };
      const current = dataRef.current || empty(targetClient);
      const { id: _ignored, ...cleanPatch } = patch;
      const changes: Partial<AnamnesisData> = { ...cleanPatch };
      if (psyRef.current && !current.psychologist_id)
        changes.psychologist_id = psyRef.current;
      if (bookingRef.current && !current.booking_id)
        changes.booking_id = bookingRef.current;
      if (!changes.status && current.status === "draft")
        changes.status = "in_progress";

      setSaving(true);
      let result;
      if (current.id) {
        // Row exists: send only the patch, by id.
        result = await supabase
          .from("client_anamneses")
          .update(changes as never)
          .eq("id", current.id)
          .select()
          .single();
      } else {
        const { id: _none, ...base } = current;
        result = await supabase
          .from("client_anamneses")
          .insert({ ...base, ...changes } as never)
          .select()
          .single();
      }
      setSaving(false);
      if (result.error || !result.data) {
        const error =
          result.error || new Error("Anamnesis was not saved (no row)");
        setSaveError(error.message || "save_failed");
        return { data: null, error };
      }
      setSaveError(null);
      const row = result.data as unknown as AnamnesisData;
      setData(row);
      return { data: row, error: null };
    },
    [targetClient, setData],
  );

  const enqueue = useCallback(
    (patch: Partial<AnamnesisData>): Promise<WriteResult> => {
      const next = chainRef.current.then(() => write(patch));
      chainRef.current = next.catch(() => undefined);
      return next;
    },
    [write],
  );

  const takePending = useCallback(() => {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const pending = pendingRef.current;
    pendingRef.current = {};
    return pending;
  }, []);

  const save = useCallback(
    (patch: Partial<AnamnesisData>) => enqueue({ ...takePending(), ...patch }),
    [enqueue, takePending],
  );

  /** Write any debounced patches now and wait for all writes to settle. */
  const flush = useCallback(async (): Promise<WriteResult> => {
    const pending = takePending();
    if (Object.keys(pending).length > 0) {
      const res = await enqueue(pending);
      if (res.error) return res;
    } else {
      await chainRef.current;
    }
    return { data: dataRef.current, error: null };
  }, [enqueue, takePending]);

  const autoSave = useCallback(
    (patch: Partial<AnamnesisData>) => {
      pendingRef.current = { ...pendingRef.current, ...patch };
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        const pending = takePending();
        if (Object.keys(pending).length > 0) void enqueue(pending);
      }, 800);
    },
    [enqueue, takePending],
  );

  /** Completion is a single write: scores, flags and status together. */
  const complete = useCallback(
    async (extra: Partial<AnamnesisData> = {}) => {
      const now = new Date().toISOString();
      return save({
        ...extra,
        status: "completed",
        completed_at: now,
        shared_with_psy_at: extra.shared_with_psy_at ?? now,
      });
    },
    [save],
  );

  const giveConsent = useCallback(async () => {
    return save({ consent_given: true, consent_at: new Date().toISOString() });
  }, [save]);

  // Psychologists only have SELECT on client_anamneses, so reviewing goes
  // through a SECURITY DEFINER RPC that checks the caller is the row's psy.
  const markReviewed = useCallback(
    async (notes?: string) => {
      const id = dataRef.current?.id;
      if (!id) return { error: new Error("No anamnesis to review") };
      const { error } = await supabase.rpc("mark_anamnesis_reviewed", {
        p_id: id,
        p_notes: notes && notes.trim() ? notes.trim() : null,
      });
      if (error) return { error };
      await load();
      return { error: null };
    },
    [load],
  );

  const progress = (() => {
    if (!data) return 0;
    const sections: AnamnesisSection[] = [
      "identity",
      "presenting_complaint",
      "history_personal",
      "history_family",
      "medical",
      "lifestyle",
      "risk_screening",
      "goals",
    ];
    const filled = sections.filter(
      (s) => Object.keys(data[s] || {}).length > 0,
    ).length;
    return Math.round((filled / sections.length) * 100);
  })();

  return {
    data,
    loading,
    saving,
    saveError,
    save,
    autoSave,
    flush,
    complete,
    giveConsent,
    markReviewed,
    reload: load,
    progress,
  };
};
