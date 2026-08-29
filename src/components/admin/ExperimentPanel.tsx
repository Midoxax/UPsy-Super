// CRM "Experiments" tab — Home hero A/B winner status, per-variant conversion,
// and one-click (or auto) promotion. Reads are admin-gated inside the
// SECURITY DEFINER RPCs; the promote action records the caller.

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FlaskConical, Sparkles, Trophy, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { crmAtLeast, useCrmRole } from "@/hooks/admin/useCrmOps";

type WinnerStatus = {
  status?: string;
  winning_variant?: string;
  control_rate?: number;
  winner_rate?: number;
  lift_pct?: number;
  confidence?: number;
  control_n?: number;
  reason?: string;
};

type WinnerRow = {
  id: string;
  experiment_id: string;
  winning_variant: string;
  control_rate: number | null;
  winner_rate: number | null;
  lift_pct: number | null;
  confidence: number | null;
  auto: boolean | null;
  decided_at: string;
};

type VariantStat = { events: number; conversions: number; rate: number };

const pct = (n: number | null | undefined) =>
  n == null || !Number.isFinite(n) ? "—" : `${(n * 100).toFixed(1)}%`;

const fmtLift = (n: number | null | undefined) =>
  n == null || !Number.isFinite(n) ? "—" : `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

export default function ExperimentPanel() {
  const { data: role } = useCrmRole();
  const canPromote = crmAtLeast(role ?? null, "manager");

  const [status, setStatus] = useState<WinnerStatus | null>(null);
  const [variants, setVariants] = useState<Record<string, VariantStat>>({});
  const [history, setHistory] = useState<WinnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [w, m, h] = await Promise.all([
      supabase.rpc("home_hero_winner").maybeSingle(),
      supabase.rpc("funnel_metrics"),
      supabase
        .from("experiment_winners")
        .select("id,experiment_id,winning_variant,control_rate,winner_rate,lift_pct,confidence,auto,decided_at")
        .order("decided_at", { ascending: false })
        .limit(10),
    ]);
    setStatus((w.data as WinnerStatus | null) ?? null);
    const byVariant = ((m.data as { by_variant?: Record<string, VariantStat> }) ?? {}).by_variant ?? {};
    setVariants(byVariant);
    setHistory((h.data as WinnerRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const promote = async () => {
    setPromoting(true);
    const { data, error } = await supabase.rpc("promote_home_hero_winner", { _auto: false });
    if (error) {
      toast.error(error.message);
      setPromoting(false);
      return;
    }
    const result = (data as { promoted?: boolean; winning_variant?: string; reason?: string }) ?? {};
    if (result.promoted) {
      toast.success(`Promoted "${result.winning_variant}" as the Home hero winner`);
    } else {
      toast.info(result.reason ? `No promotion: ${result.reason}` : "No promotable winner yet");
    }
    setPromoting(false);
    void load();
  };

  const decided = status?.status === "winner";
  const rows = Object.entries(variants).sort((a, b) => b[1].conversions - a[1].conversions);
  const leader = rows[0]?.[0];
  const hasData = rows.some(([, v]) => v.events > 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FlaskConical className="h-4 w-4 text-muted-foreground" /> Experiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">Home hero v1</p>
            <p className="text-xs text-muted-foreground">3 arms · control / clarity / offer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-muted-foreground" /> Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : decided ? (
              <div className="space-y-1">
                <Badge className="bg-emerald-500/15 text-emerald-600">Winner decided</Badge>
                <p className="text-lg font-semibold capitalize">{status?.winning_variant}</p>
                <p className="text-xs text-muted-foreground">
                  {fmtLift(status?.lift_pct)} lift · {pct(status?.confidence)} confidence
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <Badge variant="secondary">Inconclusive</Badge>
                <p className="text-xs text-muted-foreground">
                  {status?.reason ? `Reason: ${status.reason}` : "Not enough traffic yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-muted-foreground" /> Auto-promotion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The daily scan calls <code className="text-[11px]">promote_home_hero_winner</code> automatically once a
              variant clears the confidence threshold. Promote manually below to end the test early.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Variant performance (30d)</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No experiment events recorded yet. Traffic will populate this once visitors hit the Home hero.
            </p>
          ) : (
            <div className="space-y-3">
              {rows.map(([name, v]) => {
                const isLeader = name === leader;
                const maxEvents = Math.max(...rows.map(([, x]) => x.events), 1);
                return (
                  <div key={name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize flex items-center gap-2">
                        {isLeader && <Trophy className="h-3.5 w-3.5 text-amber-500" />}
                        {name}
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {v.conversions}/{v.events} · {pct(v.rate)}
                      </span>
                    </div>
                    <Progress value={(v.events / maxEvents) * 100} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Promote winner</p>
          <p className="text-xs text-muted-foreground">
            Ends the test and serves the winning variant to every visitor.
          </p>
        </div>
        <Button onClick={promote} disabled={!canPromote || promoting || !hasData} variant="default">
          {promoting ? "Promoting…" : "Promote now"}
        </Button>
      </div>

      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" /> Promotion history
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between text-xs border-b border-border/50 pb-2 last:border-0">
                  <span className="font-medium capitalize">{h.winning_variant}</span>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>{fmtLift(h.lift_pct)} lift</span>
                    <span>{pct(h.confidence)} conf</span>
                    <Badge variant={h.auto ? "secondary" : "outline"} className="text-[10px]">
                      {h.auto ? "auto" : "manual"}
                    </Badge>
                    <span>{new Date(h.decided_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
