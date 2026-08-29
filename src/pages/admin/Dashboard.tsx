import type { ComponentType } from "react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "@/lib/router-compat";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { format } from "date-fns";
import {
  Users, Activity, TrendingUp, Calendar, DollarSign, CheckCircle,
  Clock, AlertCircle, Search, ChevronDown, MoreVertical,
  UserCheck, UserX, Eye, Zap, Globe, BookOpen, Award, BarChart3, FlaskConical, Contact2,
  ArrowUpRight, ArrowDownRight, Loader2, Bell, Settings, Database,
  Shield, MessageSquare, RefreshCw, Building2, Check, X, ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import AccreditationManager from "@/components/admin/AccreditationManager";
import TranslationManager from "@/components/admin/TranslationManager";
import AnamnesisCopyEditor from "@/components/admin/AnamnesisCopyEditor";
import PricingControl from "@/components/admin/PricingControl";
import TransactionsTab from "@/components/admin/TransactionsTab";
import OrgApplicationsManager from "@/components/admin/OrgApplicationsManager";
import ObservatoireManager from "@/components/admin/ObservatoireManager";
import CrmManager from "@/components/admin/CrmManager";
import AuditTrail from "@/components/admin/AuditTrail";
import FinanceManager from "@/components/admin/FinanceManager";
import CommandPalette from "@/components/admin/CommandPalette";
import ExportCsvButton from "@/components/admin/ExportCsvButton";
import UserDetailDrawer from "@/components/admin/UserDetailDrawer";
import PsychologistEditDrawer from "@/components/admin/PsychologistEditDrawer";
import BookingDetailDrawer from "@/components/admin/BookingDetailDrawer";
import RolePreviewFrame from "@/components/admin/RolePreviewFrame";
import LearningHubManager from "@/components/admin/LearningHubManager";
import SupportInbox from "@/components/admin/SupportInbox";
import { useAllTickets } from "@/hooks/useSupportTickets";
import { rowsToCsv, downloadCsv } from "@/lib/admin/csv";

// ── Data hooks ──────────────────────────────────────────────────────────────

const usePlatformStats = () =>
  useQuery({
    queryKey: ["admin-platform-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("admin_platform_stats").select("*").single();
      if (error) throw error;
      return data as {
        total_users: number;
        active_psychologists: number;
        accredited_psychologists: number;
        total_bookings: number;
        completed_sessions: number;
        pending_bookings: number;
        upcoming_sessions: number;
        total_gross_revenue_mad: number;
        total_platform_revenue_mad: number;
        bookings_last_30d: number;
        new_users_last_30d: number;
      };
    },
    refetchInterval: 30_000,
  });

const useAllPsychologists = () =>
  useQuery({
    queryKey: ["admin-psychologists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("psychologist_profiles")
        .select(`*, psychologist_specialties(specialty:specialties(name))`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

const useAllBookings = () =>
  useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings_with_details")
        .select("*")
        .order("scheduled_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

const useAllUsers = () =>
  useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

const usePendingApplications = () =>
  useQuery({
    queryKey: ["admin-pending-apps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("psychologist_applications")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

// ── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon: ComponentType<{ className?: string }>;
  accent?: string;
}

const StatCard = ({ label, value, sub, trend, trendValue, icon: Icon, accent = "text-primary" }: StatCardProps) => (
  <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className={cn("p-2 rounded-lg bg-primary/8")}>
        <Icon className={cn("h-4 w-4", accent)} />
      </div>
    </div>
    <div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
    {trendValue && (
      <div className={cn("flex items-center gap-1 text-xs font-medium",
        trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"
      )}>
        {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
        {trendValue}
      </div>
    )}
  </div>
);

// ── Overview tab ──────────────────────────────────────────────────────────────

const OverviewTab = () => {
  const { data: stats, isLoading } = usePlatformStats();
  const { data: pending = [] } = usePendingApplications();

  if (isLoading) return (
    <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  );
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total users"
          value={stats.total_users.toLocaleString()}
          sub={`+${stats.new_users_last_30d} this month`}
          icon={Users}
          trend="up"
          trendValue={`${stats.new_users_last_30d} new`}
        />
        <StatCard
          label="Active psychologists"
          value={stats.active_psychologists}
          sub={`${stats.accredited_psychologists} accredited`}
          icon={Award}
          accent="text-purple-500"
        />
        <StatCard
          label="Sessions booked"
          value={stats.total_bookings.toLocaleString()}
          sub={`${stats.completed_sessions} completed`}
          icon={Calendar}
          trend="up"
          trendValue={`${stats.bookings_last_30d} last 30d`}
          accent="text-blue-500"
        />
        <StatCard
          label="Platform revenue"
          value={`${Math.round(stats.total_platform_revenue_mad).toLocaleString()} MAD`}
          sub={`${Math.round(stats.total_gross_revenue_mad).toLocaleString()} MAD gross`}
          icon={DollarSign}
          accent="text-green-500"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Pending bookings" value={stats.pending_bookings} icon={Clock} accent="text-amber-500" />
        <StatCard label="Upcoming sessions" value={stats.upcoming_sessions} icon={Activity} accent="text-teal-500" />
        <StatCard label="Pending applications" value={pending.length} icon={AlertCircle} accent="text-red-500" />
        <StatCard
          label="Completion rate"
          value={stats.total_bookings > 0
            ? `${Math.round((stats.completed_sessions / stats.total_bookings) * 100)}%`
            : "–"}
          icon={CheckCircle}
          accent="text-green-500"
        />
      </div>

      {pending.length > 0 && (
        <div className="flex items-start gap-4 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-600">
              {pending.length} psychologist application{pending.length > 1 ? "s" : ""} awaiting review
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review and approve applications in the Accreditation tab.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Psychologists tab ──────────────────────────────────────────────────────

const PSY_STATUS_STYLES: Record<string, string> = {
  published:    "bg-green-500/10 text-green-600 border-green-500/20",
  unpublished:  "bg-gray-500/10 text-gray-500 border-gray-500/20",
  accredited:   "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

const PsychologistsTab = () => {
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const { data: psychologists = [], isLoading } = useAllPsychologists();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase
        .from("psychologist_profiles")
        .update({ is_published: published })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-psychologists"] });
      toast({ title: "Profile updated" });
    },
  });

  const filtered = psychologists.filter((p: any) =>
    !search || p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-surface"
          />
        </div>
        <ExportCsvButton
          filename="psychologists.csv"
          rows={filtered.map((p: any) => ({
            id: p.id, name: p.full_name, city: p.city, rate: p.hourly_rate_mad,
            published: p.is_published, accredited: p.is_accredited, level: p.accreditation_level,
          }))}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">City</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Rate</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {filtered.map((p: any) => (
                <tr key={p.id} className="hover:bg-surface/50 transition-colors cursor-pointer" onClick={() => setEditId(p.id)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.photo_url ? (
                        <img src={p.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {p.full_name?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{p.full_name}</p>
                        {p.is_accredited && (
                          <p className="text-xs text-purple-600">{p.accreditation_level ?? "Accredited"}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.city ?? "–"}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {p.hourly_rate_mad ? `${p.hourly_rate_mad} MAD` : "–"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      <Badge className={cn("text-xs border", p.is_published ? PSY_STATUS_STYLES.published : PSY_STATUS_STYLES.unpublished)}>
                        {p.is_published ? "Published" : "Hidden"}
                      </Badge>
                      {p.is_accredited && (
                        <Badge className={cn("text-xs border", PSY_STATUS_STYLES.accredited)}>Accredited</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); togglePublish.mutate({ id: p.id, published: !p.is_published }); }}
                      className="text-xs"
                    >
                      {p.is_published ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground text-sm">
                    No psychologists found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <PsychologistEditDrawer psychologistId={editId} onClose={() => setEditId(null)} />
    </div>
  );
};

// ── Bookings tab ──────────────────────────────────────────────────────────────

const BOOKING_STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-500/10 text-amber-600 border-amber-500/20",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  completed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  no_show:   "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const BookingsTab = () => {
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const { data: bookings = [], isLoading } = useAllBookings();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const filtered = bookings.filter((b: any) =>
    filter === "all" || b.status === filter
  );

  const proposedSelected = filtered.filter(
    (b: any) => selected.has(b.id) && b.status === "proposed",
  );

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAllVisible = () => {
    const visibleProposed = filtered
      .filter((b: any) => b.status === "proposed")
      .map((b: any) => b.id);
    setSelected((prev) => {
      const allOn = visibleProposed.every((id: string) => prev.has(id));
      const next = new Set(prev);
      if (allOn) visibleProposed.forEach((id: string) => next.delete(id));
      else visibleProposed.forEach((id: string) => next.add(id));
      return next;
    });
  };

  const runBulk = async (action: "accept" | "decline") => {
    if (proposedSelected.length === 0) return;
    setBulkBusy(true);
    const ids = proposedSelected.map((b: any) => b.id);
    const newStatus = action === "accept" ? "confirmed" : "cancelled";
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .in("id", ids)
      .eq("status", "proposed");
    if (error) {
      toast({ title: "Bulk action failed", description: error.message, variant: "destructive" });
      setBulkBusy(false);
      return;
    }
    // Fire notifications for each (best-effort)
    await Promise.allSettled(
      ids.map((id) =>
        supabase.functions.invoke("notify-proposal-response", {
          body: { booking_id: id, action, reason: null },
        }),
      ),
    );
    toast({
      title: action === "accept" ? "Invitations accepted" : "Invitations declined",
      description: `${ids.length} booking${ids.length > 1 ? "s" : ""} updated.`,
    });
    setSelected(new Set());
    queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    setBulkBusy(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {["all", "proposed", "pending", "confirmed", "completed", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); setSelected(new Set()); }}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-all capitalize",
              filter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/40"
            )}
          >
            {s}
          </button>
        ))}
        <div className="ml-auto">
          <ExportCsvButton
            filename="bookings.csv"
            rows={filtered.map((b: any) => ({
              id: b.id, when: b.scheduled_at, patient: b.patient_name,
              psychologist: b.psychologist_name, status: b.status,
              payment: b.payment_status, amount_mad: b.amount_mad,
            }))}
          />
        </div>
      </div>

      {proposedSelected.length > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm">
          <span className="text-muted-foreground">
            {proposedSelected.length} proposed invitation
            {proposedSelected.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setSelected(new Set())} disabled={bulkBusy}>
              Clear
            </Button>
            <Button size="sm" variant="outline" onClick={() => runBulk("decline")} disabled={bulkBusy}>
              {bulkBusy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
              Decline all
            </Button>
            <Button size="sm" onClick={() => runBulk("accept")} disabled={bulkBusy}>
              {bulkBusy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
              Accept all
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="px-3 py-3 w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all proposed in view"
                    checked={
                      filtered.some((b: any) => b.status === "proposed") &&
                      filtered
                        .filter((b: any) => b.status === "proposed")
                        .every((b: any) => selected.has(b.id))
                    }
                    onChange={toggleAllVisible}
                    className="rounded-sm border-border"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Patient</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Psychologist</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">When</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {filtered.map((b: any) => (
                <tr key={b.id} className="hover:bg-surface/50 transition-colors cursor-pointer" onClick={() => setOpenId(b.id)}>
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      aria-label={`Select booking ${b.id}`}
                      disabled={b.status !== "proposed"}
                      checked={selected.has(b.id)}
                      onChange={() => toggleRow(b.id)}
                      className="rounded-sm border-border disabled:opacity-30"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{b.patient_name ?? "–"}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{b.psychologist_name ?? "–"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <p>{format(new Date(b.scheduled_at), "MMM d")}</p>
                    <p className="text-xs">{format(new Date(b.scheduled_at), "HH:mm")}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {b.amount_mad ? `${b.amount_mad} MAD` : "–"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={cn("text-xs border", BOOKING_STATUS_STYLES[b.status])}>
                      {b.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground text-sm">No bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <BookingDetailDrawer bookingId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
};

// ── Users tab ─────────────────────────────────────────────────────────────────

const UsersTab = () => {
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const { data: users = [], isLoading } = useAllUsers();

  const filtered = users.filter((u: any) =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-surface"
          />
        </div>
        <ExportCsvButton
          filename="users.csv"
          rows={filtered.map((u: any) => ({
            id: u.id, name: u.full_name, city: u.city, phone: u.phone,
            joined: u.created_at, suspended: u.is_suspended,
          }))}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">City</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {filtered.map((u: any) => (
                <tr key={u.id} className="hover:bg-surface/50 transition-colors cursor-pointer" onClick={() => setOpenId(u.id)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {u.full_name?.slice(0, 2).toUpperCase() ?? "?"}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">{u.full_name ?? "Anonymous"}</span>
                        {u.is_suspended && <Badge variant="destructive" className="ml-2 text-[10px]">Suspended</Badge>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{u.city ?? "–"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {format(new Date(u.created_at), "MMM d, yyyy")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <UserDetailDrawer userId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
};

// ── Main dashboard ────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const { data: pending = [] } = usePendingApplications();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  if (authLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
    </div>
  );

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container-custom">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h1 className="text-sm font-semibold">Admin Dashboard</h1>
              {pending.length > 0 && (
                <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">
                  {pending.length} pending
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const ev = new KeyboardEvent("keydown", { key: "k", ctrlKey: true });
                  window.dispatchEvent(ev);
                }}
                className="text-xs gap-1.5 hidden sm:inline-flex"
                title="Open command palette (Ctrl+K)"
              >
                <Search className="h-3.5 w-3.5" />
                Search… <kbd className="ml-1 text-[10px] opacity-60">⌘K</kbd>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => queryClient.invalidateQueries()}
                className="text-xs gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container-custom py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-surface border border-border p-1 rounded-xl">
            <SupportAwareTabs />
          </TabsList>

          <TabsContent value="overview"><OverviewTab /></TabsContent>
          <TabsContent value="psychologists"><PsychologistsTab /></TabsContent>
          <TabsContent value="bookings"><BookingsTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="accreditation"><AccreditationManager /></TabsContent>
          <TabsContent value="org-applications"><OrgApplicationsManager /></TabsContent>
          <TabsContent value="crm"><CrmManager /></TabsContent>
          <TabsContent value="finance"><FinanceManager /></TabsContent>
          <TabsContent value="audit"><AuditTrail /></TabsContent>
          <TabsContent value="observatoire"><ObservatoireManager /></TabsContent>
          <TabsContent value="pricing"><PricingControl /></TabsContent>
          <TabsContent value="transactions"><TransactionsTab /></TabsContent>
          <TabsContent value="translations">
            <div className="space-y-6">
              <AnamnesisCopyEditor />
              <TranslationManager />
            </div>
          </TabsContent>
          <TabsContent value="learning"><LearningHubManager /></TabsContent>
          <TabsContent value="support"><SupportInbox /></TabsContent>
          <TabsContent value="live-views"><RolePreviewFrame /></TabsContent>
        </Tabs>
      </main>
      <CommandPalette onTabChange={setActiveTab} />
    </div>
  );
};

const SupportAwareTabs = () => {
  const { data: tickets = [] } = useAllTickets();
  const pendingAdmin = tickets.filter((t) => t.status === "pending_admin").length;
  const items: Array<{ value: string; label: string; icon: any; badge?: number }> = [
    { value: "overview", label: "Overview", icon: BarChart3 },
    { value: "psychologists", label: "Psychologists", icon: Users },
    { value: "bookings", label: "Bookings", icon: Calendar },
    { value: "users", label: "Users", icon: Shield },
    { value: "accreditation", label: "Accreditation", icon: Award },
    { value: "org-applications", label: "Org. Apps", icon: Building2 },
    { value: "crm", label: "CRM", icon: Contact2 },
    { value: "finance", label: "Finance", icon: DollarSign },
    { value: "audit", label: "Audit", icon: ScrollText },
    { value: "observatoire", label: "Observatoire", icon: FlaskConical },
    { value: "pricing", label: "Pricing", icon: DollarSign },
    { value: "transactions", label: "Transactions", icon: Database },
    { value: "translations", label: "Translations", icon: Globe },
    { value: "learning", label: "Learning Hub", icon: BookOpen },
    { value: "support", label: "Support", icon: MessageSquare, badge: pendingAdmin },
    { value: "live-views", label: "Live views", icon: Eye },
  ];
  return (
    <>
      {items.map(({ value, label, icon: Icon, badge }) => (
        <TabsTrigger key={value} value={value} className="gap-1.5 text-xs relative">
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
          {badge && badge > 0 ? (
            <span className="ml-1 inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold h-4 min-w-4 px-1">
              {badge}
            </span>
          ) : null}
        </TabsTrigger>
      ))}
    </>
  );
};

export default AdminDashboard;
