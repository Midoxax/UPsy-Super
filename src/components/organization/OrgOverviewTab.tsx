import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, TrendingUp, AlertTriangle, Activity, Shield } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const OrgOverviewTab = () => {
  const { user } = useAuth();

  const { data: orgProfile } = useQuery({
    queryKey: ["org-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("organization_profiles")
        .select("*")
        .eq("admin_user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: diagnostics } = useQuery({
    queryKey: ["org-diagnostics", orgProfile?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("organization_diagnostics")
        .select("*")
        .eq("organization_id", orgProfile!.id)
        .order("created_at", { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!orgProfile?.id,
  });

  const wellbeing = orgProfile?.wellbeing_score ?? 0;
  const engagement = orgProfile?.engagement_score ?? 0;
  const burnoutRisk = orgProfile?.burnout_risk_index ?? 0;
  const employeeCount = orgProfile?.employee_count ?? 0;

  const healthDistribution = [
    { name: "Thriving", value: Math.round(wellbeing * 0.6), color: "hsl(var(--chart-2))" },
    { name: "Coping", value: Math.round(wellbeing * 0.3), color: "hsl(var(--chart-4))" },
    { name: "At Risk", value: Math.max(1, Math.round(burnoutRisk * 10)), color: "hsl(var(--chart-1))" },
  ];

  const trendData = [
    { month: "Jan", wellbeing: 62, engagement: 58, burnout: 22 },
    { month: "Feb", wellbeing: 65, engagement: 60, burnout: 20 },
    { month: "Mar", wellbeing: 63, engagement: 62, burnout: 21 },
    { month: "Apr", wellbeing: 68, engagement: 65, burnout: 18 },
    { month: "May", wellbeing: 71, engagement: 67, burnout: 16 },
    { month: "Jun", wellbeing: Math.round(wellbeing) || 72, engagement: Math.round(engagement) || 68, burnout: Math.round(burnoutRisk * 10) || 15 },
  ];

  const kpis = [
    { label: "Employees", value: employeeCount || "—", icon: Users, color: "text-primary" },
    { label: "Wellbeing Score", value: wellbeing ? `${Math.round(wellbeing)}%` : "—", icon: Heart, color: "text-chart-2" },
    { label: "Engagement", value: engagement ? `${Math.round(engagement)}%` : "—", icon: TrendingUp, color: "text-chart-4" },
    { label: "Burnout Risk", value: burnoutRisk ? `${(burnoutRisk * 100).toFixed(0)}%` : "—", icon: AlertTriangle, color: "text-chart-1" },
    { label: "Active Programs", value: diagnostics?.filter(d => d.status === "completed").length ?? 0, icon: Activity, color: "text-accent" },
    { label: "Diagnostics Run", value: diagnostics?.length ?? 0, icon: Shield, color: "text-secondary" },
  ];

  return (
    <div className="space-y-8">
      {/* Organization Name */}
      {orgProfile && (
        <div className="flex items-center gap-4">
          {orgProfile.logo_url && (
            <img src={orgProfile.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
          )}
          <div>
            <h2 className="text-h2 font-bold">{orgProfile.name}</h2>
            <p className="text-muted-foreground text-sm">{orgProfile.industry} · {orgProfile.city}</p>
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border border-border/50">
            <CardContent className="pt-4 pb-3 px-4 text-center">
              <kpi.icon className={`h-5 w-5 mx-auto mb-2 ${kpi.color}`} />
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Mental Health Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Area type="monotone" dataKey="wellbeing" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.15} name="Wellbeing" />
                <Area type="monotone" dataKey="engagement" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.15} name="Engagement" />
                <Area type="monotone" dataKey="burnout" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.15} name="Burnout Risk" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Health Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Population Health</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={healthDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {healthDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {healthDistribution.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Diagnostics */}
      {diagnostics && diagnostics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Diagnostics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {diagnostics.slice(0, 5).map((diag) => (
                <div key={diag.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div>
                    <p className="font-medium text-sm">{diag.diagnostic_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(diag.created_at!).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    diag.status === "completed" ? "bg-chart-2/10 text-chart-2" :
                    diag.status === "in_progress" ? "bg-chart-4/10 text-chart-4" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {diag.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrgOverviewTab;
