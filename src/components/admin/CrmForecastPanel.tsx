// Pipeline forecasting: weighted revenue per stage + ranked next-best-action.
// Probabilities live on crm_stages and are editable by CRM managers.

import { useMemo } from "react";
import { Loader2, Target, TrendingUp, Timer, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  useCrmForecast,
  useCrmNextBestActions,
  useCrmOpsMutations,
  useCrmRole,
  crmAtLeast,
} from "@/hooks/admin/useCrmOps";
import { useCrmStages } from "@/hooks/admin/useCrm";

const fmt = (n: number) => new Intl.NumberFormat("fr-MA").format(Math.round(n));

const CrmForecastPanel = ({ onOpenContact }: { onOpenContact: (id: string) => void }) => {
  const { data: forecast = [], isLoading } = useCrmForecast();
  const { data: actions = [] } = useCrmNextBestActions(12);
  const { data: stages = [] } = useCrmStages();
  const { data: role } = useCrmRole();
  const { setStageProbability } = useCrmOpsMutations();
  const canEdit = crmAtLeast(role ?? null, "manager");

  const open = useMemo(() => forecast.filter((r) => !r.is_won && !r.is_lost), [forecast]);
  const weighted = open.reduce((s, r) => s + Number(r.weighted_mad), 0);
  const gross = open.reduce((s, r) => s + Number(r.value_mad), 0);
  const won = forecast.filter((r) => r.is_won).reduce((s, r) => s + Number(r.value_mad), 0);
  const pipelines = Array.from(new Set(open.map((r) => r.pipeline)));

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" /> Weighted forecast
            </p>
            <p className="mt-2 text-2xl font-heading tabular-nums">{fmt(weighted)} MAD</p>
            <p className="text-xs text-muted-foreground">from {fmt(gross)} MAD of open pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground flex items-center gap-2">
              <Coins className="h-3.5 w-3.5" /> Closed won
            </p>
            <p className="mt-2 text-2xl font-heading tabular-nums">{fmt(won)} MAD</p>
            <p className="text-xs text-muted-foreground">all pipelines, lifetime</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground flex items-center gap-2">
              <Target className="h-3.5 w-3.5" /> Open deals
            </p>
            <p className="mt-2 text-2xl font-heading tabular-nums">
              {fmt(open.reduce((s, r) => s + Number(r.deal_count), 0))}
            </p>
            <p className="text-xs text-muted-foreground">{pipelines.length} active pipelines</p>
          </CardContent>
        </Card>
      </div>

      {pipelines.map((p) => {
        const rows = open.filter((r) => r.pipeline === p);
        const max = Math.max(1, ...rows.map((r) => Number(r.weighted_mad)));
        return (
          <Card key={p}>
            <CardHeader>
              <CardTitle className="text-base">{p.replace(/_/g, " ")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rows.map((r) => {
                const stage = stages.find((s) => s.pipeline === r.pipeline && s.key === r.stage);
                return (
                  <div key={`${r.pipeline}-${r.stage}`} className="space-y-1">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-medium">{r.label}</span>
                      <span className="flex items-center gap-2">
                        {canEdit && stage ? (
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            defaultValue={Number(r.probability)}
                            onBlur={(e) => {
                              const v = Number(e.target.value);
                              if (!Number.isNaN(v) && v !== Number(r.probability))
                                setStageProbability.mutate({ id: stage.id, probability: v });
                            }}
                            className="h-7 w-[68px] text-xs tabular-nums"
                          />
                        ) : (
                          <Badge variant="outline">{Number(r.probability)}%</Badge>
                        )}
                        <span className="font-mono tabular-nums text-muted-foreground">
                          {fmt(Number(r.weighted_mad))} / {fmt(Number(r.value_mad))} MAD
                        </span>
                      </span>
                    </div>
                    <Progress value={(Number(r.weighted_mad) / max) * 100} className="h-1.5" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Timer className="h-4 w-4" /> Next best actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {actions.length === 0 && (
            <p className="text-sm text-muted-foreground">No open deals to action.</p>
          )}
          {actions.map((a) => (
            <button
              key={a.deal_id}
              onClick={() => a.contact_id && onOpenContact(a.contact_id)}
              className="w-full text-left rounded-lg border border-border/60 px-3 py-2 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium truncate">
                  {a.contact_name || a.contact_email || "Unlinked deal"}
                </span>
                <span className="text-xs font-mono tabular-nums shrink-0">
                  {fmt(Number(a.weighted_mad))} MAD
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <Badge variant="secondary">{a.stage}</Badge>
                <span>{Number(a.probability)}% · idle {a.days_idle}d</span>
                <span className="text-primary">{a.action}</span>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default CrmForecastPanel;
