import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Shield, FileCheck, Eye, Search, RefreshCw, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ApprovalModal from "./ApprovalModal";
import RejectionModal from "./RejectionModal";
import AccreditationDrawer from "./AccreditationDrawer";
import AccreditationKpiRow, { KpiFilter } from "./AccreditationKpiRow";
import ExportCsvButton from "./ExportCsvButton";
import { useRetryProvisioning } from "@/hooks/admin/useAdminMutations";

type AccreditationLevel = "provisional" | "verified" | "accredited";

const LEVEL_CONFIG: Record<AccreditationLevel, { label: string; color: "outline" | "secondary" | "default"; icon: string }> = {
  provisional: { label: "Provisional", color: "outline", icon: "🔵" },
  verified:    { label: "Verified",    color: "secondary", icon: "🟡" },
  accredited:  { label: "Accredited",  color: "default", icon: "🟢" },
};

const AccreditationManager = () => {
  const { toast } = useToast();
  const { user } = useAdminAuth();
  const queryClient = useQueryClient();
  const retry = useRetryProvisioning();

  const [drawerApp, setDrawerApp] = useState<any>(null);
  const [showApproval, setShowApproval] = useState(false);
  const [showRejection, setShowRejection] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [filter, setFilter] = useState<KpiFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["accreditation-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("psychologist_applications")
        .select("*")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Latest provisioning attempt per application
  const { data: lastAttempts = {} } = useQuery({
    queryKey: ["last-attempts-per-app"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provisioning_attempts" as any)
        .select("application_id,status,error_code,error_message,duration_ms,created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      const map: Record<string, any> = {};
      for (const row of (data ?? []) as any[]) {
        if (!map[row.application_id]) map[row.application_id] = row;
      }
      return map;
    },
  });

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0, failed: 0 };
    for (const a of applications) {
      if (a.status === "pending") c.pending++;
      else if (a.status === "approved") c.approved++;
      else if (a.status === "rejected") c.rejected++;
      const last = (lastAttempts as any)[a.id];
      if (last && last.status !== "success") c.failed++;
    }
    return c;
  }, [applications, lastAttempts]);

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      const last = (lastAttempts as any)[a.id];
      const matchesFilter =
        filter === "all" ||
        (filter === "failed" ? last && last.status !== "success" : a.status === filter);
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        a.full_name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [applications, filter, search, lastAttempts]);

  const approveApplication = useMutation({
    mutationFn: async ({ applicationId }: { applicationId: string; adminUserId?: string }) => {
      const { data, error } = await supabase.functions.invoke("provision-psychologist", {
        body: { applicationId },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Provisioning failed");
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["accreditation-applications"] });
      queryClient.invalidateQueries({ queryKey: ["last-attempts-per-app"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats-enhanced"] });
      const desc = data?.alreadyProvisioned
        ? "Account already fully provisioned — no changes needed."
        : data?.reusedExistingUser
        ? "✅ Reused existing user account and finished missing steps."
        : "✅ New user account created and welcome email sent.";
      toast({ title: "Approved", description: desc });
    },
    onError: (e: Error) =>
      toast({ title: "Provisioning failed", description: e.message, variant: "destructive" }),
  });

  const rejectApplication = useMutation({
    mutationFn: async ({ applicationId, reason }: { applicationId: string; adminUserId?: string; reason?: string }) => {
      const { data, error } = await supabase.functions.invoke("send-rejection-email", {
        body: { applicationId, reason },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Rejection failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accreditation-applications"] });
      toast({ title: "Rejected", description: "Application rejected. Email sent." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const inlineLevelChange = useMutation({
    mutationFn: async ({ id, level }: { id: string; level: AccreditationLevel }) => {
      const { error } = await supabase
        .from("psychologist_applications")
        .update({ accreditation_level: level })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accreditation-applications"] });
      toast({ title: "Level updated" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  /* ---------- Bulk actions ---------- */
  const toggleAll = (on: boolean) => {
    setSelectedIds(on ? new Set(filtered.map((a) => a.id)) : new Set());
  };
  const toggleOne = (id: string, on: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id); else next.delete(id);
      return next;
    });
  };

  const bulkApprove = async () => {
    if (!user) return;
    const targets = filtered.filter((a) => selectedIds.has(a.id) && a.status === "pending");
    if (!targets.length) {
      toast({ title: "Nothing to approve", description: "Select pending applications first." });
      return;
    }
    let ok = 0, fail = 0;
    for (const t of targets) {
      try {
        await approveApplication.mutateAsync({ applicationId: t.id, adminUserId: user.id });
        ok++;
      } catch { fail++; }
    }
    setSelectedIds(new Set());
    toast({ title: "Bulk approve done", description: `${ok} ok · ${fail} failed` });
  };

  const bulkRetry = async () => {
    if (!user) return;
    const targets = filtered.filter((a) => {
      const last = (lastAttempts as any)[a.id];
      return selectedIds.has(a.id) && last && last.status !== "success";
    });
    if (!targets.length) {
      toast({ title: "Nothing to retry" });
      return;
    }
    let ok = 0, fail = 0;
    for (const t of targets) {
      try {
        await retry.mutateAsync({ applicationId: t.id, adminUserId: user.id });
        ok++;
      } catch { fail++; }
    }
    setSelectedIds(new Set());
    toast({ title: "Bulk retry done", description: `${ok} ok · ${fail} failed` });
  };

  const csvRows = filtered.map((a) => ({
    name: a.full_name,
    email: a.email,
    status: a.status,
    level: a.accreditation_level || "provisional",
    submitted_at: a.submitted_at,
    last_attempt_status: (lastAttempts as any)[a.id]?.status ?? "—",
    last_attempt_error: (lastAttempts as any)[a.id]?.error_code ?? "",
  }));

  const getStatusBadge = (status: string) => {
    const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline", approved: "default", rejected: "destructive",
    };
    return <Badge variant={map[status] || "outline"} className="capitalize">{status}</Badge>;
  };

  const getLevelBadge = (level: AccreditationLevel) => {
    const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.provisional;
    return <Badge variant={cfg.color}>{cfg.icon} {cfg.label}</Badge>;
  };

  const renderAttemptIcon = (app: any) => {
    const last = (lastAttempts as any)[app.id];
    if (!last) return <span className="text-xs text-muted-foreground">—</span>;
    if (last.status === "success") return <CheckCircle2 className="h-4 w-4 text-green-500" aria-label="ok" />;
    if (last.status === "partial") return <AlertTriangle className="h-4 w-4 text-amber-500" aria-label="partial" />;
    return <XCircle className="h-4 w-4 text-red-500" aria-label="failed" />;
  };

  const allSelected = filtered.length > 0 && filtered.every((a) => selectedIds.has(a.id));
  const someSelected = selectedIds.size > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Accreditation Workspace
              </CardTitle>
              <CardDescription>
                Review applications, manage documents, and audit provisioning. Click a KPI to filter.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <ExportCsvButton filename={`accreditation-${filter}`} rows={csvRows} />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["accreditation-applications"] });
                  queryClient.invalidateQueries({ queryKey: ["last-attempts-per-app"] });
                }}
                className="gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AccreditationKpiRow counts={counts} active={filter} onChange={setFilter} />

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-surface"
              />
            </div>
            {someSelected && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedIds.size} selected</Badge>
                <Button size="sm" onClick={bulkApprove} disabled={approveApplication.isPending}>
                  Bulk approve pending
                </Button>
                <Button size="sm" variant="outline" onClick={bulkRetry} disabled={retry.isPending}>
                  <RefreshCw className={`h-3 w-3 mr-1 ${retry.isPending ? "animate-spin" : ""}`} />
                  Bulk retry failed
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>Clear</Button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={FileCheck}
              title={filter === "pending" ? "No pending applications" : "No applications"}
              description={filter === "pending" ? "Everything is handled — view the approved psychologists tab." : "Adjust the filter or search to find applications."}
            />
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">
                      <Checkbox checked={allSelected} onCheckedChange={(v) => toggleAll(!!v)} aria-label="Select all" />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead className="text-center">Last attempt</TableHead>
                    <TableHead className="hidden lg:table-cell">Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((app) => {
                    const level = (app.accreditation_level || "provisional") as AccreditationLevel;
                    return (
                      <TableRow key={app.id} className="align-middle">
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(app.id)}
                            onCheckedChange={(v) => toggleOne(app.id, !!v)}
                            aria-label={`Select ${app.full_name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{app.full_name}</TableCell>
                        <TableCell className="text-sm hidden md:table-cell">{app.email}</TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell>
                          {app.status === "approved" ? (
                            <Select
                              value={level}
                              onValueChange={(v) => inlineLevelChange.mutate({ id: app.id, level: v as AccreditationLevel })}
                            >
                              <SelectTrigger className="h-7 w-[140px] text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="provisional">🔵 Provisional</SelectItem>
                                <SelectItem value="verified">🟡 Verified</SelectItem>
                                <SelectItem value="accredited">🟢 Accredited</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            getLevelBadge(level)
                          )}
                        </TableCell>
                        <TableCell className="text-center">{renderAttemptIcon(app)}</TableCell>
                        <TableCell className="text-sm hidden lg:table-cell">
                          {app.submitted_at ? format(new Date(app.submitted_at), "MMM d, yyyy") : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 justify-end">
                            <Button size="sm" variant="ghost" onClick={() => setDrawerApp(app)} title="Open details">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {app.status === "pending" && (
                              <>
                                <Button size="sm" variant="default" onClick={() => { setSelectedApp(app); setShowApproval(true); }}>
                                  Approve
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => { setSelectedApp(app); setShowRejection(true); }}>
                                  Reject
                                </Button>
                              </>
                            )}
                            {(lastAttempts as any)[app.id]?.status && (lastAttempts as any)[app.id].status !== "success" && user && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => retry.mutate({ applicationId: app.id, adminUserId: user.id })}
                                disabled={retry.isPending}
                                title="Retry provisioning"
                              >
                                <RefreshCw className={`h-3.5 w-3.5 ${retry.isPending ? "animate-spin" : ""}`} />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AccreditationDrawer application={drawerApp} onClose={() => setDrawerApp(null)} />

      <ApprovalModal
        open={showApproval}
        onClose={() => { setShowApproval(false); setSelectedApp(null); }}
        applicationId={selectedApp?.id}
        applicantName={selectedApp?.full_name}
        applicantEmail={selectedApp?.email}
        onConfirm={async () => {
          if (!selectedApp || !user) return;
          await approveApplication.mutateAsync({ applicationId: selectedApp.id, adminUserId: user.id });
          setShowApproval(false);
          setSelectedApp(null);
        }}
      />

      <RejectionModal
        open={showRejection}
        onClose={() => { setShowRejection(false); setSelectedApp(null); }}
        applicantName={selectedApp?.full_name}
        applicantEmail={selectedApp?.email}
        onConfirm={async (reason) => {
          if (!selectedApp || !user) return;
          await rejectApplication.mutateAsync({ applicationId: selectedApp.id, adminUserId: user.id, reason });
          setShowRejection(false);
          setSelectedApp(null);
        }}
      />
    </>
  );
};

export default AccreditationManager;
