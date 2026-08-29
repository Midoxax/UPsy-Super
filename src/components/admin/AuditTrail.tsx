// "Who accessed what" — the admin-facing window on the append-only audit log.
//
// The log never carries clinical values: writes record changed FIELD NAMES
// only, and clinical reads are recorded as `select_sensitive` events. An admin
// can therefore prove access without ever seeing the note.

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Eye,
  FileClock,
  Filter,
  Lock,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  DATA_CLASS_LABEL,
  auditEntriesToCsv,
  useAuditSearch,
  useAuditStats,
  useDataSubjectRequests,
  useUpdateDataSubjectRequest,
  type AuditFilters,
  type DataClass,
} from "@/hooks/admin/useAudit";
import { OperationsLogsPanel } from "@/components/admin/OperationsLogsPanel";

const CLASS_STYLE: Record<DataClass, string> = {
  C1: "bg-destructive/10 text-destructive border-destructive/30",
  C2: "bg-primary/10 text-primary border-primary/30",
  C3: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  C4: "bg-muted text-muted-foreground border-border",
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const MetricTile = ({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <Card className="border-border/70">
    <CardContent className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className="text-2xl font-heading tabular-nums mt-1">{value}</p>
          {hint ? <p className="text-xs text-muted-foreground mt-1">{hint}</p> : null}
        </div>
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
    </CardContent>
  </Card>
);

const AuditTrail = () => {
  const [filters, setFilters] = useState<AuditFilters>({ dataClass: "all", action: "all", limit: 200 });
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAuditStats(30);
  const { data: entries = [], isLoading, refetch } = useAuditSearch(filters);
  const { data: requests = [] } = useDataSubjectRequests();
  const updateRequest = useUpdateDataSubjectRequest();
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const actions = useMemo(() => Object.keys(stats?.by_action ?? {}), [stats]);

  const exportCsv = () => {
    const blob = new Blob([auditEntriesToCsv(entries)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `upsy-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const set = (patch: Partial<AuditFilters>) => setFilters((f) => ({ ...f, ...patch }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          Append-only · six-year retention · clinical content never stored in the log
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => {
            refetch();
            refetchStats();
          }}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricTile label="Events (30d)" value={statsLoading ? "—" : (stats?.total ?? 0)} icon={FileClock} />
        <MetricTile
          label="Clinical touches"
          value={statsLoading ? "—" : (stats?.clinical ?? 0)}
          hint="C1 writes + reads"
          icon={ShieldCheck}
        />
        <MetricTile label="Sensitive reads" value={statsLoading ? "—" : (stats?.reads ?? 0)} icon={Eye} />
        <MetricTile label="Distinct actors" value={statsLoading ? "—" : (stats?.actors ?? 0)} icon={Users} />
        <MetricTile
          label="Subject requests"
          value={statsLoading ? "—" : (stats?.open_requests ?? 0)}
          hint={stats?.overdue_requests ? `${stats.overdue_requests} overdue` : "none overdue"}
          icon={Filter}
        />
      </div>

      <Tabs defaultValue="trail" className="space-y-4">
        <TabsList className="bg-surface border border-border p-1 rounded-xl">
          <TabsTrigger value="trail" className="text-xs">Access trail</TabsTrigger>
          <TabsTrigger value="requests" className="text-xs">
            Data-subject requests
            {stats?.open_requests ? (
              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] h-4 min-w-4 px-1">
                {stats.open_requests}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="ops" className="text-xs">Operations log</TabsTrigger>
        </TabsList>

        <TabsContent value="trail" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Filters</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
              <div className="space-y-1.5">
                <Label className="text-xs">Actor (user id)</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="uuid"
                  value={filters.actor ?? ""}
                  onChange={(e) => set({ actor: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Subject (user id)</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="uuid"
                  value={filters.subject ?? ""}
                  onChange={(e) => set({ subject: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Resource</Label>
                <Input
                  className="h-9 text-xs"
                  placeholder="session_notes"
                  value={filters.resource ?? ""}
                  onChange={(e) => set({ resource: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Data class</Label>
                <Select
                  value={filters.dataClass ?? "all"}
                  onValueChange={(v) => set({ dataClass: v as DataClass | "all" })}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All classes</SelectItem>
                    {(Object.keys(DATA_CLASS_LABEL) as DataClass[]).map((c) => (
                      <SelectItem key={c} value={c}>{c} · {DATA_CLASS_LABEL[c]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Action</Label>
                <Select value={filters.action ?? "all"} onValueChange={(v) => set({ action: v })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All actions</SelectItem>
                    {actions.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">From</Label>
                  <Input
                    type="date"
                    className="h-9 text-xs"
                    value={filters.from ?? ""}
                    onChange={(e) => set({ from: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">To</Label>
                  <Input
                    type="date"
                    className="h-9 text-xs"
                    value={filters.to ?? ""}
                    onChange={(e) => set({ to: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">
                {isLoading ? "Loading…" : `${entries.length} event${entries.length === 1 ? "" : "s"}`}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                disabled={entries.length === 0}
                onClick={exportCsv}
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-surface/60 text-muted-foreground">
                    <tr className="text-left">
                      <th className="px-4 py-2 font-medium">When</th>
                      <th className="px-4 py-2 font-medium">Actor</th>
                      <th className="px-4 py-2 font-medium">Action</th>
                      <th className="px-4 py-2 font-medium">Resource</th>
                      <th className="px-4 py-2 font-medium">Class</th>
                      <th className="px-4 py-2 font-medium">Subject</th>
                      <th className="px-4 py-2 font-medium">Fields changed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e) => (
                      <tr key={e.id} className="border-t border-border/60 align-top">
                        <td className="px-4 py-2 whitespace-nowrap tabular-nums">{fmt(e.created_at)}</td>
                        <td className="px-4 py-2">
                          <div className="font-medium">{e.actor_email ?? e.user_id ?? "system"}</div>
                          {e.actor_role ? (
                            <div className="text-muted-foreground">{e.actor_role}</div>
                          ) : null}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">{e.action}</td>
                        <td className="px-4 py-2">
                          <div>{e.resource_type}</div>
                          {e.record_ref ? (
                            <div className="text-muted-foreground truncate max-w-[14ch]">{e.record_ref}</div>
                          ) : null}
                        </td>
                        <td className="px-4 py-2">
                          <Badge variant="outline" className={CLASS_STYLE[e.data_class]}>
                            {e.data_class}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">{e.subject_email ?? e.subject_id ?? "—"}</td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {(e.changed?.fields ?? []).join(", ") || "—"}
                        </td>
                      </tr>
                    ))}
                    {!isLoading && entries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                          No events match these filters.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-3">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No data-subject requests on file.
              </CardContent>
            </Card>
          ) : (
            requests.map((r) => {
              const overdue = r.status !== "fulfilled" && new Date(r.due_at) < new Date();
              return (
                <Card key={r.id} className={overdue ? "border-destructive/40" : undefined}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{r.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.request_type} · filed {fmt(r.created_at)} · due {fmt(r.due_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {overdue ? <Badge variant="destructive">Overdue</Badge> : null}
                        <Badge variant="outline">{r.status}</Badge>
                      </div>
                    </div>
                    <Textarea
                      className="text-xs"
                      rows={2}
                      placeholder="Handling notes (what was exported, what was restricted rather than deleted, legal basis)"
                      value={noteDraft[r.id] ?? r.notes ?? ""}
                      onChange={(e) => setNoteDraft((d) => ({ ...d, [r.id]: e.target.value }))}
                    />
                    <div className="flex flex-wrap gap-2">
                      {["in_progress", "fulfilled", "refused"].map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={r.status === s ? "default" : "outline"}
                          className="text-xs"
                          disabled={updateRequest.isPending}
                          onClick={() =>
                            updateRequest.mutate({ id: r.id, status: s, notes: noteDraft[r.id] ?? r.notes ?? "" })
                          }
                        >
                          Mark {s.replace("_", " ")}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="ops" className="space-y-4">
          <OperationsLogsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditTrail;
