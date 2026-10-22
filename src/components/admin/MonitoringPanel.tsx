import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Clock,
  Mail,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// What each scheduled job does, in plain words for the admin.
const JOBS: Record<string, string> = {
  "process-email-queue": "Sends queued emails through Resend (every 5 s)",
  "session-reminders-cron-every-10min":
    "Session reminders by email and WhatsApp",
  "anamnesis-reminder-every-6h":
    "Reminds patients to fill in their intake form",
  "content-automation-hourly":
    "Blog to social networks and the monthly newsletter",
  "ops-task-watcher": "Ops workspace task watcher",
  "home-hero-auto-promote": "Promotes the winning home-page hero variant",
  "purge-app-logs": "Deletes old application logs",
  "purge-audit-log": "Deletes audit entries past retention",
  "purge-expired-clinical-records":
    "Deletes clinical records past 10-year retention",
};

const ago = (d: string | null) => {
  if (!d) return "never";
  const m = Math.round((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  if (m < 48 * 60) return `${Math.round(m / 60)} h ago`;
  return `${Math.round(m / 1440)} days ago`;
};

/** One screen to see whether the platform's automations are healthy. */
export default function MonitoringPanel() {
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["admin-monitoring"],
    refetchInterval: 60_000,
    queryFn: async () => {
      const [cron, email, runs] = await Promise.all([
        supabase.rpc("admin_cron_status"),
        supabase.rpc("admin_email_health"),
        supabase
          .from("automation_runs")
          .select("*")
          .order("started_at", { ascending: false })
          .limit(15),
      ]);
      return {
        cron: cron.data ?? [],
        cronError: cron.error?.message,
        email: (email.data ?? {}) as {
          by_status?: Record<string, number>;
          recent_failures?: Array<{
            created_at: string;
            template_name: string;
            recipient_email: string;
            status: string;
            error_message: string | null;
          }>;
          suppressed?: number;
        },
        runs: runs.data ?? [],
      };
    },
  });

  if (!data)
    return <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />;
  const failing = data.cron.filter(
    (j) => j.last_status === "failed" || j.failures_24h > 0,
  );
  const by = data.email.by_status ?? {};
  const sent = by.sent ?? 0;
  const bad = (by.failed ?? 0) + (by.dlq ?? 0) + (by.bounced ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant={failing.length ? "destructive" : "default"}>
            {failing.length
              ? `${failing.length} job(s) failing`
              : "All scheduled jobs healthy"}
          </Badge>
          <Badge variant={bad > sent / 10 ? "destructive" : "outline"}>
            Email 7 days: {sent} sent · {by.pending ?? 0} pending · {bad} failed
          </Badge>
          <Badge variant="outline">
            {data.email.suppressed ?? 0} suppressed addresses
          </Badge>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
          />{" "}
          Refresh
        </Button>
      </div>

      <Card className="p-5 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" /> Scheduled jobs
        </h3>
        {data.cronError && (
          <p className="text-sm text-destructive">{data.cronError}</p>
        )}
        <div className="divide-y divide-border">
          {data.cron.map((j) => (
            <div
              key={j.jobname}
              className="py-2.5 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {j.last_status === "succeeded" && !j.failures_24h ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : j.last_status === "failed" ? (
                  <XCircle className="w-4 h-4 text-destructive shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {JOBS[j.jobname] ?? j.jobname}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {j.jobname} · {j.schedule}
                    {!j.active && " · paused"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground sm:text-right">
                Last run {ago(j.last_start)}
                {j.failures_24h > 0 && (
                  <span className="text-destructive">
                    {" "}
                    · {j.failures_24h} failures in 24 h
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Automation runs
        </h3>
        {data.runs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No run recorded yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {data.runs.map((r) => (
              <div
                key={r.id}
                className="py-2 text-sm flex flex-col sm:flex-row gap-1 sm:gap-4"
              >
                <span className="flex items-center gap-2 sm:w-56 shrink-0">
                  {r.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : r.ok === false ? (
                    <XCircle className="w-4 h-4 text-destructive" />
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                  {r.job} · {ago(r.started_at)}
                </span>
                <code className="text-xs text-muted-foreground break-all">
                  {JSON.stringify(r.summary).slice(0, 240)}
                </code>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" /> Recent email failures
        </h3>
        {(data.email.recent_failures ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            None in the last 7 days.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {data.email.recent_failures!.map((f, i) => (
              <div key={i} className="py-2 text-sm">
                <p>
                  <Badge variant="destructive" className="mr-2">
                    {f.status}
                  </Badge>
                  {f.template_name} → {f.recipient_email}
                  <span className="text-xs text-muted-foreground">
                    {" "}
                    · {ago(f.created_at)}
                  </span>
                </p>
                {f.error_message && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {f.error_message}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Application logs and the audit trail are under Audit → Ops.
        </p>
      </Card>
    </div>
  );
}
