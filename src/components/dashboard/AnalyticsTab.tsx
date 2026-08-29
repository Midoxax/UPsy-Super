import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, TrendingUp, Users, Calendar, DollarSign, Star, BarChart3, Lock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useHasFeature } from "@/hooks/useSpecialistPlan";
import { UpgradePromptCard } from "@/components/dashboard/UpgradePromptCard";

const COLORS = ["hsl(42,100%,50%)", "hsl(200,80%,50%)", "hsl(150,60%,45%)", "hsl(0,70%,55%)"];

const AnalyticsTab = () => {
  const { user } = useAuth();
  const { has: hasBasic, isLoading: planLoading } = useHasFeature("analytics_basic");
  const { has: hasAdvanced } = useHasFeature("analytics_advanced");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    totalRevenue: 0,
    avgRating: 0,
    reviewCount: 0,
    uniqueClients: 0,
  });
  const [sessionsByMonth, setSessionsByMonth] = useState<any[]>([]);
  const [sessionsByType, setSessionsByType] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !hasBasic) return;
    loadAnalytics();
  }, [user, hasBasic]);

  const loadAnalytics = async () => {
    const [sessionsRes, reviewsRes, profileRes] = await Promise.all([
      supabase.from("sessions").select("id, date_time, status, session_type, duration_minutes, client_id").eq("psychologist_id", user!.id),
      supabase.from("reviews").select("rating").eq("psychologist_id", user!.id),
      supabase.from("psychologist_profiles").select("hourly_rate_mad").eq("id", user!.id).single(),
    ]);

    const sessions = sessionsRes.data || [];
    const reviews = reviewsRes.data || [];
    const rate = profileRes.data?.hourly_rate_mad || 0;

    const completed = sessions.filter((s) => s.status === "completed");
    const uniqueClients = new Set(sessions.map((s) => s.client_id)).size;
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    setStats({
      totalSessions: sessions.length,
      completedSessions: completed.length,
      totalRevenue: completed.length * rate,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length,
      uniqueClients,
    });

    // Sessions by month (last 6 months)
    const monthMap = new Map<string, number>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthMap.set(d.toLocaleDateString("en", { month: "short" }), 0);
    }
    completed.forEach((s) => {
      const month = new Date(s.date_time).toLocaleDateString("en", { month: "short" });
      if (monthMap.has(month)) monthMap.set(month, (monthMap.get(month) || 0) + 1);
    });
    setSessionsByMonth(Array.from(monthMap, ([month, count]) => ({ month, sessions: count })));

    // Sessions by type
    const typeMap = new Map<string, number>();
    sessions.forEach((s) => {
      const type = s.session_type || "unknown";
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    setSessionsByType(Array.from(typeMap, ([name, value]) => ({ name, value })));

    setLoading(false);
  };

  if (planLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasBasic) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-h3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Analytics
          </h2>
          <p className="text-sm text-muted-foreground">
            Understand your practice performance — sessions, revenue trends, client retention.
          </p>
        </div>
        <UpgradePromptCard
          title="Unlock practice analytics"
          description="See your sessions, revenue trends, and top specialties. Upgrade to Pro for basic charts, or Elite for advanced retention and heatmaps."
          requiredPlan="Pro"
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const kpis = [
    { label: "Total Sessions", value: stats.totalSessions, icon: Calendar, color: "text-primary" },
    { label: "Unique Clients", value: stats.uniqueClients, icon: Users, color: "text-accent" },
    { label: "Revenue (MAD)", value: stats.totalRevenue.toLocaleString(), icon: DollarSign, color: "text-primary" },
    { label: "Avg Rating", value: stats.avgRating || "—", icon: Star, color: "text-accent" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-h3 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" /> Analytics
        </h2>
        <p className="text-sm text-muted-foreground">Track your practice performance and income.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="glass-card p-5 text-center">
            <kpi.icon className={`w-6 h-6 mx-auto mb-2 ${kpi.color}`} />
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Basic charts (Pro+) */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Sessions (Last 6 Months)
          </h3>
          {sessionsByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sessionsByMonth}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(0,0%,45%)" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(0,0%,45%)" }} />
                <Tooltip contentStyle={{ background: "hsl(0,0%,13%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                <Bar dataKey="sessions" fill="hsl(42,100%,50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-4">Session Types</h3>
          {sessionsByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={sessionsByType} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {sessionsByType.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Advanced (Elite only) */}
      {hasAdvanced ? (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" /> Advanced insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground">Repeat clients</p>
              <p className="text-2xl font-bold mt-1">
                {stats.uniqueClients > 0
                  ? `${Math.round((1 - stats.uniqueClients / Math.max(stats.completedSessions, 1)) * 100)}%`
                  : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground">Avg sessions / client</p>
              <p className="text-2xl font-bold mt-1">
                {stats.uniqueClients > 0
                  ? (stats.completedSessions / stats.uniqueClients).toFixed(1)
                  : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground">Completion rate</p>
              <p className="text-2xl font-bold mt-1">
                {stats.totalSessions > 0
                  ? `${Math.round((stats.completedSessions / stats.totalSessions) * 100)}%`
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <UpgradePromptCard
          title="Advanced analytics"
          description="Client retention, top specialties, and hour-of-day heatmap. Available on Elite."
          requiredPlan="Elite"
        />
      )}
    </div>
  );
};

export default AnalyticsTab;
