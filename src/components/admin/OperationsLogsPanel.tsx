// "Operations log" tab inside /admin/audit — runtime + deploy events and
// client/server errors written to app_logs. Searchable, filterable by
// level/source/environment, CSV-exportable, with a 24h stats strip and an
// admin-gated purge action.

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, RefreshCw, Trash2, Activity, Server, AlertTriangle } from "lucide-react";
import {
  appLogsToCsv,
  useAppLogsSearch,
  useAppLogsStats,
  usePurgeAppLogs,
  type AppLogEntry,
} from "@/hooks/admin/useAppLogs";

const LEVEL_STYLE: Record<string, string> = {
  error: "bg-destructive/10 text-destructive border-destructive/30",
  warn: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  info: "bg-primary/10 text-primary border-primary/30",
  debug: "bg-muted text-muted-foreground border-border",
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-border/70">
      <CardContent className="p-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className="text-2xl font-heading tabular-nums mt-1">{value}</p>
        </div>
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      </CardContent>
    </Card>
  );
}

export function OperationsLogsPanel() {
  const [level, setLevel] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [env, setEnv] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const filters = {
    level: level || undefined,
    source: source || undefined,
    env: env || undefined,
    search: search || undefined,
    limit: 300,
  };

  const { data: rows, isLoading, refetch } = useAppLogsSearch(filters);
  const { data: stats } = useAppLogsStats(24);
  const purge = usePurgeAppLogs();

  const handleExport = () => {
    const csv = appLogsToCsv(rows ?? []);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `upsy-operations-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Events (24h)" value={stats?.total ?? "—"} icon={Activity} />
        <StatTile
          label="Errors (24h)"
          value={stats?.by_level?.error ?? stats?.by_level?.["error"] ?? 0}
          icon={AlertTriangle}
        />
        <StatTile
          label="Top source"
          value={
            stats?.by_source
              ? Object.entries(stats.by_source).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"
              : "—"
          }
          icon={Server}
        />
        <StatTile
          label="Error rate"
          value={
            stats?.error_rate != null
              ? `${(stats.error_rate * 100).toFixed(1)}%`
              : "—"
          }
          icon={AlertTriangle}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading flex items-center justify-between">
            <span>Runtime & deploy events</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="h-7 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={!rows?.length}
                className="h-7 text-xs"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm("Purge all operations logs? This cannot be undone.")) purge.mutate();
                }}
                disabled={purge.isPending}
                className="h-7 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Purge
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="error">error</SelectItem>
                  <SelectItem value="warn">warn</SelectItem>
                  <SelectItem value="info">info</SelectItem>
                  <SelectItem value="debug">debug</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="client">client</SelectItem>
                  <SelectItem value="server">server</SelectItem>
                  <SelectItem value="runtime">runtime</SelectItem>
                  <SelectItem value="deploy">deploy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Environment</Label>
              <Select value={env} onValueChange={setEnv}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="production">production</SelectItem>
                  <SelectItem value="preview">preview</SelectItem>
                  <SelectItem value="development">development</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Search</Label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="message, route…"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="rounded-lg border border-border/70 overflow-hidden">
            <div className="max-h-[480px] overflow-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 sticky top-0">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Time</th>
                    <th className="px-3 py-2 font-medium">Level</th>
                    <th className="px-3 py-2 font-medium">Source</th>
                    <th className="px-3 py-2 font-medium">Event</th>
                    <th className="px-3 py-2 font-medium">Message</th>
                    <th className="px-3 py-2 font-medium">Route</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Loading…</td></tr>
                  ) : !rows?.length ? (
                    <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">No events match these filters.</td></tr>
                  ) : (
                    rows.map((r: AppLogEntry) => (
                      <tr key={r.id} className="border-t border-border/40 hover:bg-muted/30">
                        <td className="px-3 py-2 whitespace-nowrap text-muted-foreground tabular-nums">{fmt(r.created_at)}</td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className={`text-[10px] ${LEVEL_STYLE[r.level] ?? LEVEL_STYLE.info}`}>
                            {r.level}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{r.source}</td>
                        <td className="px-3 py-2 font-mono text-[11px]">{r.event}</td>
                        <td className="px-3 py-2 max-w-[320px] truncate" title={r.message ?? ""}>{r.message ?? "—"}</td>
                        <td className="px-3 py-2 text-muted-foreground truncate max-w-[160px]">{r.route ?? "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Retained 6 years per the compliance posture. Deploy and runtime-server events are
            written server-side; client errors arrive via <code>/api/public/runtime-logs</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
