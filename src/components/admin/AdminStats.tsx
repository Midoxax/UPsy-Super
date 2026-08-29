import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, MessageSquare, CreditCard, TrendingUp, Shield, UserCheck, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const AdminStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats-enhanced"],
    queryFn: async () => {
      const [psychologists, applications, allApplications, requests, subscriptions, sessions, leads, profiles] = await Promise.all([
        supabase.from("psychologist_profiles").select("id, is_published, is_accredited, accreditation_level, created_at", { count: "exact" }),
        supabase.from("psychologist_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("psychologist_applications").select("id, status, accreditation_level"),
        supabase.from("client_matching_requests").select("id", { count: "exact", head: true }),
        supabase.from("subscriptions").select("id, plan_type, status"),
        supabase.from("sessions").select("id, status", { count: "exact" }),
        supabase.from("leads").select("id, status"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

      const subData = subscriptions.data || [];
      const appData = allApplications.data || [];
      const leadData = leads.data || [];
      const psychData = psychologists.data || [];

      return {
        totalPsychologists: psychologists.count || 0,
        publishedPsychologists: psychData.filter(p => p.is_published).length,
        accreditedPsychologists: psychData.filter(p => p.is_accredited).length,
        pendingApplications: applications.count || 0,
        matchingRequests: requests.count || 0,
        activeSubscriptions: subData.filter(s => s.status === "active" && s.plan_type !== "free").length,
        totalSessions: sessions.count || 0,
        totalUsers: profiles.count || 0,
        applicationsByStatus: {
          pending: appData.filter(a => a.status === "pending").length,
          approved: appData.filter(a => a.status === "approved").length,
          rejected: appData.filter(a => a.status === "rejected").length,
        },
        accreditationLevels: {
          provisional: psychData.filter(p => p.accreditation_level === "provisional" || !p.accreditation_level).length,
          verified: psychData.filter(p => p.accreditation_level === "verified").length,
          accredited: psychData.filter(p => p.accreditation_level === "accredited").length,
        },
        subscriptionsByPlan: {
          free: subData.filter(s => s.plan_type === "free").length,
          basic: subData.filter(s => s.plan_type === "basic").length,
          premium: subData.filter(s => s.plan_type === "premium").length,
        },
        leadsByStatus: {
          pending: leadData.filter(l => l.status === "pending" || l.status === "new").length,
          contacted: leadData.filter(l => l.status === "contacted").length,
          converted: leadData.filter(l => l.status === "converted").length,
        },
      };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded-sm" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded-sm" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-500" },
    { title: "Total Psychologists", value: stats?.totalPsychologists || 0, icon: UserCheck, color: "text-emerald-500" },
    { title: "Published Profiles", value: stats?.publishedPsychologists || 0, icon: TrendingUp, color: "text-green-500" },
    { title: "Accredited", value: stats?.accreditedPsychologists || 0, icon: Shield, color: "text-primary" },
    { title: "Pending Applications", value: stats?.pendingApplications || 0, icon: FileCheck, color: "text-amber-500" },
    { title: "Matching Requests", value: stats?.matchingRequests || 0, icon: MessageSquare, color: "text-purple-500" },
    { title: "Active Subscriptions", value: stats?.activeSubscriptions || 0, icon: CreditCard, color: "text-cyan-500" },
    { title: "Total Sessions", value: stats?.totalSessions || 0, icon: Clock, color: "text-rose-500" },
  ];

  const applicationChartData = [
    { name: "Pending", value: stats?.applicationsByStatus.pending || 0, fill: "hsl(var(--chart-1))" },
    { name: "Approved", value: stats?.applicationsByStatus.approved || 0, fill: "hsl(var(--chart-2))" },
    { name: "Rejected", value: stats?.applicationsByStatus.rejected || 0, fill: "hsl(var(--chart-3))" },
  ];

  const accreditationChartData = [
    { name: "Provisional", count: stats?.accreditationLevels.provisional || 0 },
    { name: "Verified", count: stats?.accreditationLevels.verified || 0 },
    { name: "Accredited", count: stats?.accreditationLevels.accredited || 0 },
  ];

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Applications Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={applicationChartData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {applicationChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accreditation Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accreditationChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStats;
