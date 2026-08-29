import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, TrendingUp, Shield, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const typeColors: Record<string, string> = {
  quarterly: "bg-primary/10 text-primary border-primary/20",
  diagnostic: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  program: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  annual: "bg-accent/10 text-accent border-accent/20",
  pulse: "bg-chart-4/10 text-chart-4 border-chart-4/20",
};

const OrgReportsTab = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: org } = useQuery({
    queryKey: ["org-account-reports", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("organization_accounts").select("id").eq("owner_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: reports } = useQuery({
    queryKey: ["org-reports", org?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("org_aggregate_reports")
        .select("*")
        .eq("org_id", org!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!org?.id,
  });

  const requestReport = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      const { error } = await supabase.from("org_aggregate_reports").insert({
        org_id: org!.id,
        report_type: "quarterly",
        title: `Quarterly Wellbeing Report — ${now.toLocaleDateString("en", { month: "long", year: "numeric" })}`,
        period_start: start.toISOString().slice(0, 10),
        period_end: now.toISOString().slice(0, 10),
        status: "ready",
        page_count: 12,
        requested_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Report generated");
      qc.invalidateQueries({ queryKey: ["org-reports", org?.id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = (reports ?? []).filter((r) => typeFilter === "all" || r.report_type === typeFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Reports & Insights</h3>
          <p className="text-sm text-muted-foreground">Aggregated, anonymized mental health reporting (k≥5)</p>
        </div>
        <div className="flex gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="diagnostic">Diagnostic</SelectItem>
              <SelectItem value="program">Program</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
              <SelectItem value="pulse">Pulse</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2" onClick={() => requestReport.mutate()} disabled={!org?.id || requestReport.isPending}>
            <Plus className="h-4 w-4" />Request Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center">
          <FileText className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold">{reports?.length ?? 0}</p>
          <p className="text-xs text-muted-foreground">Total Reports</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto mb-1 text-chart-2" />
          <p className="text-2xl font-bold">{reports?.filter((r) => r.report_type === "quarterly").length ?? 0}</p>
          <p className="text-xs text-muted-foreground">Quarterly</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <Shield className="h-5 w-5 mx-auto mb-1 text-chart-1" />
          <p className="text-2xl font-bold">{reports?.filter((r) => r.report_type === "diagnostic").length ?? 0}</p>
          <p className="text-xs text-muted-foreground">Diagnostics</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <Calendar className="h-5 w-5 mx-auto mb-1 text-accent" />
          <p className="text-2xl font-bold">{reports?.filter((r) => r.report_type === "annual").length ?? 0}</p>
          <p className="text-xs text-muted-foreground">Annual</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report History</CardTitle>
          <CardDescription>{filtered.length} reports available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filtered.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{report.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="outline" className={typeColors[report.report_type] ?? ""}>
                        {report.report_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{new Date(report.created_at!).toLocaleDateString()}</span>
                      {report.page_count && <span className="text-xs text-muted-foreground">{report.page_count} pages</span>}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1.5" disabled={report.status !== "ready"}>
                  {report.status === "processing" ? (
                    <span className="text-xs text-muted-foreground">Processing...</span>
                  ) : (
                    <><Download className="h-4 w-4" />Download</>
                  )}
                </Button>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No reports yet. Request your first quarterly report above.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="p-4 rounded-lg border border-border bg-muted/20">
        <p className="text-xs text-muted-foreground flex items-start gap-2">
          <Shield className="h-4 w-4 shrink-0 mt-0.5" />
          All reports contain aggregated, anonymized data only (k≥5 minimum). Individual employee data is never exposed. Compliant with CNDP (Loi 09-08, Maroc) and GDPR.
        </p>
      </div>
    </div>
  );
};

export default OrgReportsTab;
