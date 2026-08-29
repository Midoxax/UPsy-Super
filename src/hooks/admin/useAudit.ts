// Audit-trail data access for /admin/audit.
//
// Everything goes through the SECURITY DEFINER RPCs `audit_search` and
// `audit_stats`, which raise "Access denied" for non-admins. The audit_log
// table itself is append-only: no UPDATE/DELETE grant exists and a database
// trigger rejects both, so nothing here can rewrite history.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DataClass = "C1" | "C2" | "C3" | "C4";

export const DATA_CLASS_LABEL: Record<DataClass, string> = {
  C1: "Clinical",
  C2: "Identity",
  C3: "Commercial",
  C4: "Operational",
};

export type AuditEntry = {
  id: string;
  created_at: string;
  user_id: string | null;
  actor_email: string | null;
  actor_role: string | null;
  action: string;
  resource_type: string;
  record_ref: string | null;
  data_class: DataClass;
  subject_id: string | null;
  subject_email: string | null;
  changed: { fields?: string[] } | null;
  metadata: Record<string, unknown> | null;
  request_ip: string | null;
};

export type AuditFilters = {
  actor?: string;
  subject?: string;
  resource?: string;
  dataClass?: DataClass | "all";
  action?: string | "all";
  from?: string;
  to?: string;
  limit?: number;
};

export type AuditStats = {
  total: number;
  clinical: number;
  reads: number;
  actors: number;
  oldest_entry: string | null;
  by_class: Record<string, number>;
  by_action: Record<string, number>;
  by_resource: Record<string, number>;
  open_requests: number;
  overdue_requests: number;
};

const nullable = (v?: string) => (v && v.trim().length > 0 ? v.trim() : undefined);
const uuidOrNull = (v?: string) =>
  v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.trim())
    ? v.trim()
    : undefined;

export const useAuditStats = (days = 30) =>
  useQuery({
    queryKey: ["audit", "stats", days],
    queryFn: async (): Promise<AuditStats> => {
      const { data, error } = await supabase.rpc("audit_stats", { _days: days });
      if (error) throw error;
      return data as unknown as AuditStats;
    },
    staleTime: 60_000,
  });

export const useAuditSearch = (filters: AuditFilters) =>
  useQuery({
    queryKey: ["audit", "search", filters],
    queryFn: async (): Promise<AuditEntry[]> => {
      const { data, error } = await supabase.rpc("audit_search", {
        _actor: uuidOrNull(filters.actor),
        _subject: uuidOrNull(filters.subject),
        _resource: nullable(filters.resource),
        _class: filters.dataClass && filters.dataClass !== "all" ? filters.dataClass : undefined,
        _action: filters.action && filters.action !== "all" ? filters.action : undefined,
        _from: nullable(filters.from) ? new Date(filters.from as string).toISOString() : undefined,
        _to: nullable(filters.to) ? new Date(filters.to as string).toISOString() : undefined,
        _limit: filters.limit ?? 200,
      });
      if (error) throw error;
      return (data ?? []) as unknown as AuditEntry[];
    },
    staleTime: 15_000,
  });

export type DataSubjectRequest = {
  id: string;
  user_id: string | null;
  email: string;
  request_type: string;
  status: string;
  legal_basis: string | null;
  notes: string | null;
  due_at: string;
  fulfilled_at: string | null;
  created_at: string;
};

export const useDataSubjectRequests = () =>
  useQuery({
    queryKey: ["audit", "dsr"],
    queryFn: async (): Promise<DataSubjectRequest[]> => {
      const { data, error } = await supabase
        .from("data_subject_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as unknown as DataSubjectRequest[];
    },
  });

export const useUpdateDataSubjectRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const patch: { status: string; notes?: string; fulfilled_at?: string } = { status };
      if (notes !== undefined) patch.notes = notes;
      if (status === "fulfilled") patch.fulfilled_at = new Date().toISOString();
      const { error } = await supabase.from("data_subject_requests").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["audit", "dsr"] });
      qc.invalidateQueries({ queryKey: ["audit", "stats"] });
    },
  });
};

export const auditEntriesToCsv = (rows: AuditEntry[]): string => {
  const head = [
    "occurred_at",
    "actor_id",
    "actor_email",
    "actor_role",
    "action",
    "resource",
    "record_ref",
    "data_class",
    "subject_id",
    "subject_email",
    "changed_fields",
    "request_ip",
  ];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      r.created_at,
      r.user_id,
      r.actor_email,
      r.actor_role,
      r.action,
      r.resource_type,
      r.record_ref,
      r.data_class,
      r.subject_id,
      r.subject_email,
      (r.changed?.fields ?? []).join(" "),
      r.request_ip,
    ]
      .map(esc)
      .join(","),
  );
  return [head.join(","), ...lines].join("\n");
};
