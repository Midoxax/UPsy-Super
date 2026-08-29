// Operations-log access for /admin/audit → "Operations log" tab.
//
// All reads go through the SECURITY DEFINER RPCs `app_logs_search` and
// `app_logs_stats`, which raise "Access denied" for non-admins. Purge is the
// same — `purge_app_logs()` is admin-gated. The app_logs table is a runtime
// sink for deploy events and client/server errors (retained 6 years per the
// compliance posture), distinct from the append-only audit_log.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppLogEntry = {
  id: number;
  created_at: string;
  level: string;
  source: string;
  event: string;
  message: string | null;
  environment: string;
  release: string | null;
  route: string | null;
  status_code: number | null;
  duration_ms: number | null;
  request_id: string | null;
  metadata: Record<string, unknown> | null;
};

export type AppLogFilters = {
  level?: string;
  source?: string;
  env?: string;
  search?: string;
  from?: string;
  to?: string;
  limit?: number;
};

const DEFAULT_LIMIT = 200;

export function useAppLogsSearch(filters: AppLogFilters) {
  return useQuery({
    queryKey: ["app-logs", filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("app_logs_search", {
        _level: filters.level ?? null,
        _source: filters.source ?? null,
        _env: filters.env ?? null,
        _search: filters.search ?? null,
        _from: filters.from ?? null,
        _to: filters.to ?? null,
        _limit: filters.limit ?? DEFAULT_LIMIT,
      } as never);
      if (error) throw error;
      return (data ?? []) as AppLogEntry[];
    },
    staleTime: 15_000,
  });
}

export function useAppLogsStats(hours = 24) {
  return useQuery({
    queryKey: ["app-logs-stats", hours],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("app_logs_stats", { _hours: hours });
      if (error) throw error;
      return data as AppLogStats;
    },
    staleTime: 30_000,
  });
}

export function usePurgeAppLogs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("purge_app_logs");
      if (error) throw error;
      return data as number;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-logs"] });
      qc.invalidateQueries({ queryKey: ["app-logs-stats"] });
    },
  });
}

export type AppLogStats = {
  total?: number;
  by_level?: Record<string, number>;
  by_source?: Record<string, number>;
  by_event?: Record<string, number>;
  error_rate?: number;
  window_hours?: number;
};

const csvEscape = (v: unknown) => {
  if (v == null) return "";
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function appLogsToCsv(rows: AppLogEntry[]): string {
  const cols = [
    "id",
    "created_at",
    "level",
    "source",
    "event",
    "message",
    "environment",
    "release",
    "route",
    "status_code",
    "duration_ms",
    "request_id",
    "metadata",
  ];
  const head = cols.join(",");
  const body = rows
    .map((r) => cols.map((c) => csvEscape((r as Record<string, unknown>)[c])).join(","))
    .join("\n");
  return `${head}\n${body}`;
}
