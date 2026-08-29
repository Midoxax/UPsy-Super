import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { Brain, TrendingUp, TrendingDown, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";

interface MPS {
  total: number;
  dimensions: {
    mood: number;
    consistency: number;
    engagement: number;
    recovery: number;
    growth: number;
  };
  delta: number;
  sample_size: number;
}

interface Props {
  refreshKey?: number;
}

export default function MentalPerformanceScore({ refreshKey }: Props) {
  const { user } = useAuth();
  const { t } = useLocale();
  const [mps, setMps] = useState<MPS | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void load();
  }, [user, refreshKey]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("compute_mps" as never, { _user_id: user!.id } as never);
    if (!error && data) setMps(data as unknown as MPS);
    setLoading(false);
  };

  const dims = mps?.dimensions
    ? [
        { name: t("mps.mood") || "Mood", value: mps.dimensions.mood, fill: "hsl(var(--primary))" },
        { name: t("mps.consistency") || "Consistency", value: mps.dimensions.consistency, fill: "hsl(var(--accent))" },
        { name: t("mps.engagement") || "Engagement", value: mps.dimensions.engagement, fill: "hsl(var(--primary))" },
        { name: t("mps.recovery") || "Recovery", value: mps.dimensions.recovery, fill: "hsl(var(--accent))" },
        { name: t("mps.growth") || "Growth", value: mps.dimensions.growth, fill: "hsl(var(--primary))" },
      ]
    : [];

  const total = mps?.total ?? 0;
  const delta = mps?.delta ?? 0;

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-h3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            {t("mps.title") || "Mental Performance Score"}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    {t("mps.tooltip") ||
                      "A weighted score (0-100) blending your mood, check-in consistency, session engagement, recovery, and growth activities over the last 14-30 days."}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {t("mps.basedOn") || "Based on"} {mps?.sample_size ?? 0} {t("mps.checkIns") || "check-ins"}
          </p>
        </div>
        {delta !== 0 && (
          <div className={`flex items-center gap-1 text-sm font-medium ${delta > 0 ? "text-accent" : "text-destructive"}`}>
            {delta > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {delta > 0 ? "+" : ""}
            {delta}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-[200px_1fr] gap-6 items-center">
        <div className="relative h-[200px]">
          {loading ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">…</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={[{ value: total, fill: "hsl(var(--primary))" }]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background={{ fill: "hsl(var(--muted))" } as never} dataKey="value" cornerRadius={20} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-bold text-foreground">{total}</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
            </>
          )}
        </div>

        <div className="space-y-2.5">
          {dims.map((d) => (
            <div key={d.name}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">{d.name}</span>
                <span className="font-medium text-foreground">{d.value}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${d.value}%`, backgroundColor: d.fill }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
