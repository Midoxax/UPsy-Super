// CRM "Funnels" tab — campaign funnel performance by variant and source/UTM,
// plus the end-to-end Observatoire funnel report for the last N days. Both
// reads are admin-gated inside the SECURITY DEFINER RPCs.

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Funnel, Globe, FlaskConical } from "lucide-react";
import { crmAtLeast, useCrmRole } from "@/hooks/admin/useCrmOps";
import {
  useFunnelMetrics,
  useObservatoireFunnelReport,
  type FunnelMetrics,
  type ObservatoireFunnelReport,
} from "@/hooks/admin/useCrmOps";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const num = (n: number) => n.toLocaleString();

function downloadJson(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function VariantTable({ data }: { data: FunnelMetrics }) {
  const rows = Object.entries(data.by_variant).sort((a, b) => b[1].conversions - a[1].conversions);
  return (
    <div className="rounded-lg border border-border/70 overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-muted/40">
          <tr className="text-left text-muted-foreground">
            <th className="px-3 py-2 font-medium">Variant</th>
            <th className="px-3 py-2 font-medium text-right">Events</th>
            <th className="px-3 py-2 font-medium text-right">Conversions</th>
            <th className="px-3 py-2 font-medium text-right">Rate</th>
            <th className="px-3 py-2 font-medium w-32">Funnel</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">No events in window.</td></tr>
          ) : rows.map(([variant, m]) => (
            <tr key={variant} className="border-t border-border/40">
              <td className="px-3 py-2 font-mono">{variant}</td>
              <td className="px-3 py-2 text-right tabular-nums">{num(m.events)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{num(m.conversions)}</td>
              <td className="px-3 py-2 text-right tabular-nums font-medium">{pct(m.rate)}</td>
              <td className="px-3 py-2"><Progress value={m.rate * 100} className="h-1.5" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SourceTable({ data }: { data: FunnelMetrics }) {
  const rows = Object.entries(data.by_source).sort((a, b) => b[1].events - a[1].events);
  return (
    <div className="rounded-lg border border-border/70 overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-muted/40">
          <tr className="text-left text-muted-foreground">
            <th className="px-3 py-2 font-medium">Source</th>
            <th className="px-3 py-2 font-medium text-right">Events</th>
            <th className="px-3 py-2 font-medium text-right">Conversions</th>
            <th className="px-3 py-2 font-medium text-right">Rate</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">No events in window.</td></tr>
          ) : rows.map(([source, m]) => (
            <tr key={source} className="border-t border-border/40">
              <td className="px-3 py-2 font-mono">{source}</td>
              <td className="px-3 py-2 text-right tabular-nums">{num(m.events)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{num(m.conversions)}</td>
              <td className="px-3 py-2 text-right tabular-nums font-medium">{pct(m.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ObservatoireReport({ report }: { report: ObservatoireFunnelReport }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/70"><CardContent className="p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Starts</p>
          <p className="text-2xl font-heading tabular-nums mt-1">{num(report.total_starts)}</p>
        </CardContent></Card>
        <Card className="border-border/70"><CardContent className="p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Completions</p>
          <p className="text-2xl font-heading tabular-nums mt-1">{num(report.completions)}</p>
        </CardContent></Card>
        <Card className="border-border/70"><CardContent className="p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Completion rate</p>
          <p className="text-2xl font-heading tabular-nums mt-1">{pct(report.completion_rate)}</p>
        </CardContent></Card>
      </div>

      <div className="rounded-lg border border-border/70 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/40">
            <tr className="text-left text-muted-foreground">
              <th className="px-3 py-2 font-medium">Step</th>
              <th className="px-3 py-2 font-medium text-right">Count</th>
              <th className="px-3 py-2 font-medium text-right">Step rate</th>
              <th className="px-3 py-2 font-medium w-40">Drop-off funnel</th>
            </tr>
          </thead>
          <tbody>
            {report.steps.map((s) => (
              <tr key={s.step} className="border-t border-border/40">
                <td className="px-3 py-2">{s.label}</td>
                <td className="px-3 py-2 text-right tabular-nums">{num(s.count)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{pct(s.rate)}</td>
                <td className="px-3 py-2"><Progress value={s.rate * 100} className="h-1.5" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {Object.keys(report.by_track ?? {}).length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">By track</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(report.by_track).map(([track, m]) => (
              <Badge key={track} variant="outline" className="text-xs">
                {track}: {num(m.completions)}/{num(m.starts)} ({pct(m.rate)})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {Object.keys(report.lead_tags ?? {}).length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Lead tags (survey-derived)</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(report.lead_tags).map(([tag, n]) => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}: {num(n)}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CrmFunnelPanel() {
  const [days, setDays] = useState(7);
  const { data: role } = useCrmRole();
  const roleOk = crmAtLeast(role ?? null, "viewer");
  const metrics = useFunnelMetrics();
  const obs = useObservatoireFunnelReport(days);

  if (!roleOk) {
    return (
      <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
        You do not have CRM access.
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading flex items-center justify-between">
            <span className="flex items-center gap-2"><Funnel className="h-4 w-4 text-muted-foreground" /> Campaign funnel performance</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadJson(`funnel-metrics-${new Date().toISOString().slice(0, 10)}.json`, metrics.data)}
              disabled={!metrics.data}
              className="h-7 text-xs"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export
            </Button>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Conversions by hero variant, traffic source, and UTM — last 30 days by default.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.isLoading ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : metrics.data ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Card className="border-border/70"><CardContent className="p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Total events</p>
                  <p className="text-2xl font-heading tabular-nums mt-1">{num(metrics.data.total_events)}</p>
                </CardContent></Card>
                <Card className="border-border/70"><CardContent className="p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Conversion rate</p>
                  <p className="text-2xl font-heading tabular-nums mt-1">{pct(metrics.data.conversion_rate)}</p>
                </CardContent></Card>
                <Card className="border-border/70"><CardContent className="p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Variants tested</p>
                  <p className="text-2xl font-heading tabular-nums mt-1">{Object.keys(metrics.data.by_variant).length}</p>
                </CardContent></Card>
              </div>
              <VariantTable data={metrics.data} />
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2 flex items-center gap-1.5"><Globe className="h-3 w-3" /> By source</p>
                <SourceTable data={metrics.data} />
              </div>
            </>
          ) : metrics.error ? (
            <p className="text-xs text-destructive">Failed to load funnel metrics.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-heading flex items-center justify-between">
            <span className="flex items-center gap-2"><FlaskConical className="h-4 w-4 text-muted-foreground" /> Observatoire funnel report</span>
            <div className="flex items-center gap-2">
              <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
                <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last 24h</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadJson(`observatoire-funnel-${days}d.json`, obs.data)}
                disabled={!obs.data}
                className="h-7 text-xs"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" /> Export
              </Button>
            </div>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            End-to-end completion rates and lead tagging — survey answers are never linked to contacts.
          </p>
        </CardHeader>
        <CardContent>
          {obs.isLoading ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : obs.data ? (
            <ObservatoireReport report={obs.data} />
          ) : obs.error ? (
            <p className="text-xs text-destructive">Failed to load report.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
