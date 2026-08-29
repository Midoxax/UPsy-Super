import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfWeek, subDays } from "date-fns";

interface BurnoutMetrics {
  weeklyHours: number;
  avgDailySessions: number;
  consecutiveDays: number;
  lateNightSessions: number;
  riskScore: number; // 0-100
  level: "low" | "moderate" | "high";
}

const compute = (sessions: { scheduled_at: string; duration_minutes: number; status: string }[]): BurnoutMetrics => {
  const completed = sessions.filter((s) => s.status === "completed" || s.status === "confirmed");
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const thisWeek = completed.filter((s) => new Date(s.scheduled_at) >= weekStart);
  const weeklyHours = thisWeek.reduce((acc, s) => acc + (s.duration_minutes ?? 50) / 60, 0);

  const last14 = completed.filter((s) => new Date(s.scheduled_at) >= subDays(new Date(), 14));
  const days = new Set(last14.map((s) => new Date(s.scheduled_at).toISOString().slice(0, 10)));
  const avgDailySessions = days.size > 0 ? last14.length / days.size : 0;

  // consecutive days streak
  const sortedDates = [...days].sort();
  let consecutive = 0;
  let maxConsecutive = 0;
  let prev: Date | null = null;
  for (const d of sortedDates) {
    const cur = new Date(d);
    if (prev && (cur.getTime() - prev.getTime()) === 86400000) consecutive++;
    else consecutive = 1;
    maxConsecutive = Math.max(maxConsecutive, consecutive);
    prev = cur;
  }

  const lateNightSessions = last14.filter((s) => {
    const h = new Date(s.scheduled_at).getHours();
    return h >= 21 || h < 7;
  }).length;

  // Weighted risk score
  const hoursScore = Math.min(weeklyHours / 30, 1) * 40;
  const consecutiveScore = Math.min(maxConsecutive / 10, 1) * 25;
  const lateScore = Math.min(lateNightSessions / 5, 1) * 20;
  const densityScore = Math.min(avgDailySessions / 6, 1) * 15;
  const riskScore = Math.round(hoursScore + consecutiveScore + lateScore + densityScore);

  const level: BurnoutMetrics["level"] =
    riskScore >= 70 ? "high" : riskScore >= 40 ? "moderate" : "low";

  return { weeklyHours: Math.round(weeklyHours * 10) / 10, avgDailySessions: Math.round(avgDailySessions * 10) / 10, consecutiveDays: maxConsecutive, lateNightSessions, riskScore, level };
};

const SpecialistBurnoutCard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<BurnoutMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const since = subDays(new Date(), 21).toISOString();
      const { data } = await supabase
        .from("bookings")
        .select("scheduled_at, duration_minutes, status")
        .eq("psychologist_id", user.id)
        .gte("scheduled_at", since);
      setMetrics(compute(data ?? []));
      setLoading(false);
    })();
  }, [user]);

  if (loading || !metrics) {
    return (
      <Card className="p-5 animate-pulse">
        <div className="h-4 w-32 bg-muted rounded-sm mb-3" />
        <div className="h-2 w-full bg-muted rounded-sm" />
      </Card>
    );
  }

  const tone =
    metrics.level === "high"
      ? "bg-destructive/10 border-destructive/30 text-destructive"
      : metrics.level === "moderate"
      ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400";

  const Icon = metrics.level === "high" ? AlertTriangle : metrics.level === "moderate" ? Activity : Heart;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            Clinician load
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Based on the last 14 days</p>
        </div>
        <Badge variant="outline" className={tone}>
          {metrics.level === "high" ? "Elevated" : metrics.level === "moderate" ? "Watch" : "Healthy"}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Risk index</span>
          <span className="font-medium text-foreground">{metrics.riskScore}/100</span>
        </div>
        <Progress value={metrics.riskScore} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">This week</p>
          <p className="font-semibold text-foreground">{metrics.weeklyHours}h</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Daily avg</p>
          <p className="font-semibold text-foreground">{metrics.avgDailySessions} sessions</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Streak</p>
          <p className="font-semibold text-foreground">{metrics.consecutiveDays} days</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Late-night</p>
          <p className="font-semibold text-foreground">{metrics.lateNightSessions}</p>
        </div>
      </div>

      {metrics.level !== "low" && (
        <p className="text-xs text-muted-foreground border-t pt-3">
          {metrics.level === "high"
            ? "Consider blocking recovery time and declining new bookings this week."
            : "Your pace is sustainable but trending up — protect one full rest day."}
        </p>
      )}
    </Card>
  );
};

export default SpecialistBurnoutCard;
