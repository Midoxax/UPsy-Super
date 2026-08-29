import { useState } from "react";
import { useProvisioningAttempts } from "@/hooks/useProvisioningAttempts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertTriangle, XCircle, Clock, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

const statusIcon = (s: string) => {
  if (s === "success") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (s === "partial") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <XCircle className="h-4 w-4 text-destructive" />;
};

export const ProvisioningAuditTab = ({ applicationId }: { applicationId?: string }) => {
  const [filter, setFilter] = useState<"all" | "success" | "partial" | "failure">("all");
  const { data = [], isLoading, refetch } = useProvisioningAttempts(applicationId);

  const filtered = data.filter((a) => filter === "all" || a.status === filter);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Provisioning Audit
          </CardTitle>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
              <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" onClick={() => refetch()}><RefreshCw className="h-3 w-3" /></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground py-6 text-center">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">No provisioning attempts yet.</div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((a) => (
              <li key={a.id} className="rounded-lg border p-3 bg-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    {statusIcon(a.status)}
                    <span className="font-medium capitalize">{a.status}</span>
                    {a.reused_existing_user && <Badge variant="secondary" className="text-[10px]">reused</Badge>}
                    {a.already_provisioned && <Badge variant="outline" className="text-[10px]">already provisioned</Badge>}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {format(new Date(a.created_at), "PP p")} · {a.duration_ms ?? 0}ms
                  </div>
                </div>
                {a.error_code && (
                  <div className="mt-2 text-xs">
                    <span className="font-mono text-destructive">{a.error_code}</span>
                    {a.error_message && <span className="text-muted-foreground"> — {a.error_message}</span>}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(a.steps || []).map((s, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] border ${
                        s.ok ? (s.skipped ? "border-muted text-muted-foreground" : "border-emerald-500/40 text-emerald-600") : "border-destructive/40 text-destructive"
                      }`}
                      title={s.error || ""}
                    >
                      {s.step}{s.skipped ? " (skip)" : ""} · {s.ms}ms
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default ProvisioningAuditTab;