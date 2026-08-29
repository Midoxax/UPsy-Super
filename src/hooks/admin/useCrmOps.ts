// CRM operations layer: role-based access, automations, notifications,
// email sync, consent evidence export and pipeline forecasting.
//
// Every read below is gated server-side (RLS on the crm_* tables, an explicit
// role check inside the reporting functions). Anything rendered here is a
// convenience — a non-staff account gets zero rows, never a partial view.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// The generated Supabase types lag behind this migration; the untyped handle
// keeps the call sites honest without disabling type safety everywhere else.
const db = supabase as unknown as {
  from: (t: string) => any;
  rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: any; error: any }>;
  auth: typeof supabase.auth;
};

const KEY = ["admin", "crm-ops"] as const;

export type CrmRole = "viewer" | "agent" | "manager" | null;

export type CrmForecastRow = {
  pipeline: string;
  stage: string;
  label: string;
  stage_position: number;
  probability: number;
  deal_count: number;
  value_mad: number;
  weighted_mad: number;
  is_won: boolean;
  is_lost: boolean;
};

export type CrmNextBestAction = {
  deal_id: string;
  contact_id: string | null;
  contact_name: string | null;
  contact_email: string | null;
  pipeline: string;
  stage: string;
  value_mad: number;
  probability: number;
  weighted_mad: number;
  days_idle: number;
  action: string;
};

export type CrmAutomationRule = {
  id: string;
  name: string;
  event_kind: string;
  source_match: string | null;
  subject_match: string | null;
  pipeline: string;
  stage: string;
  deal_title: string | null;
  deal_value_mad: number;
  set_lifecycle: string | null;
  notify: boolean;
  active: boolean;
  position: number;
};

export type CrmNotification = {
  id: string;
  owner_id: string | null;
  contact_id: string | null;
  deal_id: string | null;
  title: string;
  body: string | null;
  severity: "info" | "action" | "urgent";
  read_at: string | null;
  created_at: string;
};

export type CrmEmailMessage = {
  id: string;
  contact_id: string | null;
  email: string;
  direction: "outbound" | "inbound";
  campaign: string | null;
  template: string | null;
  subject: string | null;
  status: string;
  opened_at: string | null;
  clicked_at: string | null;
  sent_at: string;
};

export type ConsentEvidenceRow = {
  contact_id: string;
  email: string;
  full_name: string | null;
  contact_type: string;
  lifecycle: string;
  source: string | null;
  first_touch: Record<string, unknown> | null;
  contact_created_at: string;
  purpose: string | null;
  granted: boolean | null;
  basis: string | null;
  recorded_at: string | null;
  withdrawn_at: string | null;
  evidence: Record<string, unknown> | null;
};

/** Effective CRM role of the signed-in user (platform admins are managers). */
export const useCrmRole = () =>
  useQuery({
    queryKey: [...KEY, "role"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<CrmRole> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await db.rpc("crm_role", { _user_id: auth.user.id });
      if (error) return null;
      return (data as CrmRole) ?? null;
    },
  });

const RANK: Record<string, number> = { viewer: 1, agent: 2, manager: 3 };
export const crmAtLeast = (role: CrmRole, min: "viewer" | "agent" | "manager") =>
  (RANK[role ?? ""] ?? 0) >= RANK[min];

/** Weighted pipeline value per stage. */
export const useCrmForecast = () =>
  useQuery({
    queryKey: [...KEY, "forecast"],
    queryFn: async () => {
      const { data, error } = await db.rpc("crm_pipeline_forecast");
      if (error) throw error;
      return (data ?? []) as CrmForecastRow[];
    },
  });

/** Highest-leverage open deals with a suggested action. */
export const useCrmNextBestActions = (limit = 10) =>
  useQuery({
    queryKey: [...KEY, "nba", limit],
    queryFn: async () => {
      const { data, error } = await db.rpc("crm_next_best_actions", { _limit: limit });
      if (error) throw error;
      return (data ?? []) as CrmNextBestAction[];
    },
  });

export const useCrmAutomationRules = () =>
  useQuery({
    queryKey: [...KEY, "rules"],
    queryFn: async () => {
      const { data, error } = await db
        .from("crm_automation_rules")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CrmAutomationRule[];
    },
  });

export const useCrmNotifications = (onlyUnread = false) =>
  useQuery({
    queryKey: [...KEY, "notifications", onlyUnread],
    refetchInterval: 60_000,
    queryFn: async () => {
      let q = db
        .from("crm_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (onlyUnread) q = q.is("read_at", null);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as CrmNotification[];
    },
  });

export const useCrmEmails = (contactId: string | null) =>
  useQuery({
    queryKey: [...KEY, "emails", contactId],
    enabled: !!contactId,
    queryFn: async () => {
      const { data, error } = await db
        .from("crm_email_messages")
        .select("*")
        .eq("contact_id", contactId)
        .order("sent_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as CrmEmailMessage[];
    },
  });

/** Manager-only: per-contact consent state + source, for audits. */
export const fetchConsentEvidence = async (): Promise<ConsentEvidenceRow[]> => {
  const { data, error } = await db.rpc("crm_consent_evidence");
  if (error) throw error;
  return (data ?? []) as ConsentEvidenceRow[];
};

export const useCrmOpsMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });

  const toggleRule = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await db.from("crm_automation_rules").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const setStageProbability = useMutation({
    mutationFn: async ({ id, probability }: { id: string; probability: number }) => {
      const { error } = await db
        .from("crm_stages")
        .update({ probability: Math.max(0, Math.min(100, probability)) })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: ["admin", "crm"] });
    },
  });

  const markNotificationRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db
        .from("crm_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { toggleRule, setStageProbability, markNotificationRead, invalidate };
};

// ---- Campaign funnel performance + Observatoire funnel report ----

export type FunnelMetrics = {
  window: { from: string; to: string };
  total_events: number;
  by_variant: Record<string, { events: number; conversions: number; rate: number }>;
  by_source: Record<string, { events: number; conversions: number; rate: number }>;
  by_utm: Record<string, Record<string, { events: number; conversions: number; rate: number }>>;
  conversion_rate: number;
};

export function useFunnelMetrics(from?: string, to?: string) {
  return useQuery({
    queryKey: ["admin", "crm-ops", "funnel-metrics", from, to],
    queryFn: async () => {
      const { data, error } = await db.rpc("funnel_metrics", {
        _from: from ?? null,
        _to: to ?? null,
      });
      if (error) throw error;
      return data as FunnelMetrics;
    },
    staleTime: 60_000,
  });
}

export type ObservatoireFunnelStep = {
  step: string;
  label: string;
  count: number;
  rate: number;
};

export type ObservatoireFunnelReport = {
  window_days: number;
  from: string;
  to: string;
  steps: ObservatoireFunnelStep[];
  completions: number;
  completion_rate: number;
  total_starts: number;
  by_track: Record<string, { starts: number; completions: number; rate: number }>;
  lead_tags: Record<string, number>;
};

export function useObservatoireFunnelReport(days = 7) {
  return useQuery({
    queryKey: ["admin", "crm-ops", "observatoire-funnel", days],
    queryFn: async () => {
      const { data, error } = await db.rpc("observatoire_funnel_report", { _days: days });
      if (error) throw error;
      return data as ObservatoireFunnelReport;
    },
    staleTime: 60_000,
  });
}
