import type { ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfMonth, subMonths } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign, TrendingUp, Clock, CheckCircle, Loader2,
  Star, Users, Calendar, Wallet, Hourglass, Banknote, Download,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { useEarningsSummary, usePayouts } from "@/hooks/useSpecialistPayouts";
import { useSpecialistPlan } from "@/hooks/useSpecialistPlan";
import { Link } from "@/lib/router-compat";

const usePsychologistEarnings = () => {
  const { user } = useAuth();
  const { data: plan } = useSpecialistPlan();
  const platformFee = plan?.commission_rate ?? 0.20;
  return useQuery({
    queryKey: ["psy-earnings", user?.id, platformFee],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const [bookingsRes, profileRes, reviewsRes] = await Promise.all([
        supabase
          .from("bookings")
          .select("id, scheduled_at, status, amount_mad, payment_status, duration_minutes, session_type, patient_id")
          .eq("psychologist_id", user.id)
          .order("scheduled_at", { ascending: false }),
        supabase
          .from("psychologist_profiles")
          .select("hourly_rate_mad, full_name")
          .eq("id", user.id)
          .single(),
        supabase
          .from("reviews")
          .select("rating")
          .eq("psychologist_id", user.id),
      ]);

      const bookings = bookingsRes.data ?? [];
      const rate = profileRes.data?.hourly_rate_mad ?? 0;
      const reviews = reviewsRes.data ?? [];

      const completed = bookings.filter((b) => b.status === "completed");
      const pending = bookings.filter((b) => b.status === "pending" || b.status === "confirmed");

      const monthlyMap = new Map<string, number>();
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        monthlyMap.set(format(d, "MMM"), 0);
      }
      completed.forEach((b) => {
        const mo = format(new Date(b.scheduled_at), "MMM");
        const amt = b.amount_mad ?? rate;
        if (monthlyMap.has(mo)) monthlyMap.set(mo, (monthlyMap.get(mo) ?? 0) + amt);
      });
      const monthly = Array.from(monthlyMap, ([month, amount]) => ({ month, amount }));

      const thisMonthStart = startOfMonth(new Date());
      const thisMonth = completed.filter((b) => new Date(b.scheduled_at) >= thisMonthStart);
      const thisMonthRevenue = thisMonth.reduce((s, b) => s + (b.amount_mad ?? rate), 0);

      const totalRevenue = completed.reduce((s, b) => s + (b.amount_mad ?? rate), 0);
      const netRevenue = totalRevenue * (1 - platformFee);
      const netThisMonth = thisMonthRevenue * (1 - platformFee);

      const avgRating = reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : null;

      const typeMap = new Map<string, number>();
      completed.forEach((b) => {
        const t = b.session_type ?? "video";
        typeMap.set(t, (typeMap.get(t) ?? 0) + 1);
      });
      const typeBreakdown = Array.from(typeMap, ([name, value]) => ({ name, value }));

      const uniquePatients = new Set(bookings.map((b) => b.patient_id)).size;

      return {
        totalSessions: completed.length,
        pendingSessions: pending.length,
        uniquePatients,
        totalRevenue: Math.round(totalRevenue),
        netRevenue: Math.round(netRevenue),
        thisMonthRevenue: Math.round(thisMonthRevenue),
        netThisMonth: Math.round(netThisMonth),
        commissionRate: platformFee,
        avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        reviewCount: reviews.length,
        monthly,
        typeBreakdown,
        recentBookings: bookings.slice(0, 10),
        hourlyRate: rate,
      };
    },
    enabled: !!user,
  });
};

const Stat = ({
  label, value, sub, icon: Icon, accent = "text-primary"
}: { label: string; value: string | number; sub?: string; icon: ComponentType<{ className?: string }>; accent?: string }) => (
  <div className="bg-surface border border-border rounded-2xl p-5 space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
      <Icon className={cn("h-4 w-4", accent)} />
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
  </div>
);

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  pending:   "bg-amber-500/10 text-amber-600 border-amber-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  no_show:   "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const PIE_COLORS = ["#1D9E75", "#378ADD", "#EF9F27", "#D85A30"];

export const EarningsTab = () => {
  const { data, isLoading } = usePsychologistEarnings();
  const { data: summary } = useEarningsSummary();
  const { data: payouts = [] } = usePayouts();

  if (isLoading) return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );

  if (!data) return null;

  const exportTaxStatement = () => {
    const year = new Date().getFullYear();
    const settled = data.recentBookings.filter(
      (b: any) => b.payment_status === "succeeded" || b.status === "completed"
    );
    const rows = [
      ["Date", "Type", "Duration (min)", "Gross MAD", "Status"],
      ...settled.map((b: any) => [
        format(new Date(b.scheduled_at), "yyyy-MM-dd"),
        b.session_type ?? "",
        String(b.duration_minutes ?? ""),
        String(b.amount_mad ?? ""),
        b.status ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `upsy-earnings-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const PAYOUT_STATUS_STYLES: Record<string, string> = {
    paid: "bg-green-500/10 text-green-600 border-green-500/20",
    processing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    failed: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="Available to withdraw"
          value={`${(summary?.available_to_withdraw ?? 0).toLocaleString()} MAD`}
          sub="Settled, not yet paid out"
          icon={Wallet}
          accent="text-green-500"
        />
        <Stat
          label="Pending settlement"
          value={`${(summary?.pending_settlement ?? 0).toLocaleString()} MAD`}
          sub="Awaiting client payment"
          icon={Hourglass}
          accent="text-amber-500"
        />
        <Stat
          label="Paid out (lifetime)"
          value={`${(summary?.paid_out_lifetime ?? 0).toLocaleString()} MAD`}
          sub={`${data.totalSessions} sessions`}
          icon={Banknote}
          accent="text-blue-500"
        />
        <Stat label="Rating" value={data.avgRating ? `${data.avgRating} / 5` : "No reviews"} sub={data.reviewCount > 0 ? `${data.reviewCount} review${data.reviewCount > 1 ? "s" : ""}` : undefined} icon={Star} accent="text-amber-500" />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-surface border-border md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Revenue — last 6 months
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data.monthly}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1D9E75" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1D9E75" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: number) => [`${v.toLocaleString()} MAD`, "Gross"]}
                  contentStyle={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="amount" stroke="#1D9E75" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Session types</CardTitle>
          </CardHeader>
          <CardContent>
            {data.typeBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={data.typeBreakdown} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value">
                      {data.typeBreakdown.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {data.typeBreakdown.map((t, i) => (
                    <div key={t.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="capitalize text-muted-foreground">{t.name.replace("_", " ")}</span>
                      </div>
                      <span className="font-medium">{t.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No sessions yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payouts section */}
      <Card className="bg-surface border-border">
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            Payouts
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportTaxStatement} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export tax statement
          </Button>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6">
              No payouts yet — first payout processes once you have ≥500 MAD settled.
            </div>
          ) : (
            <div className="space-y-2">
              {payouts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {format(new Date(p.period_start), "MMM d")} — {format(new Date(p.period_end), "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.payout_method ?? "Bank transfer"}{p.reference ? ` · ${p.reference}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{Number(p.net_mad).toLocaleString()} MAD</span>
                    <Badge className={cn("text-xs border capitalize", PAYOUT_STATUS_STYLES[p.status])}>
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="p-4 rounded-xl border border-border bg-surface text-sm">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-4 w-4 text-primary" />
          <span className="font-medium">Revenue summary</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-muted-foreground text-xs mb-1">Gross revenue</p>
            <p className="font-bold">{data.totalRevenue.toLocaleString()} MAD</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">
              Platform fee ({Math.round((data.commissionRate ?? 0.2) * 100)}%)
            </p>
            <p className="font-bold text-muted-foreground">{(data.totalRevenue - data.netRevenue).toLocaleString()} MAD</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Your net earnings</p>
            <p className="font-bold text-green-600">{data.netRevenue.toLocaleString()} MAD</p>
          </div>
        </div>
        {(data.commissionRate ?? 0.2) >= 0.20 && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Lower commission on{" "}
            <Link to="/my-space?tab=plans" className="text-primary hover:underline font-medium">
              Pro (12%) or Elite (8%)
            </Link>
          </p>
        )}
      </div>

      <Card className="bg-surface border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Recent sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No sessions yet.</p>
            ) : (
              data.recentBookings.map((b: any) => (
                <div key={b.id} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{format(new Date(b.scheduled_at), "MMM d, yyyy")}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {format(new Date(b.scheduled_at), "HH:mm")} · {b.session_type?.replace("_", " ")} · {b.duration_minutes}min
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {b.amount_mad && <span className="text-sm font-medium">{b.amount_mad} MAD</span>}
                    <Badge className={cn("text-xs border capitalize", STATUS_STYLES[b.status])}>{b.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EarningsTab;
