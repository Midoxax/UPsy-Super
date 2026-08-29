import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  LogOut, Plus, Loader2, User, FileText, Calendar,
} from "lucide-react";
import { format } from "date-fns";

interface DischargeSummary {
  id: string;
  client_id: string;
  reason: string;
  progress_summary: string | null;
  aftercare_recommendations: string | null;
  initial_scores: any;
  final_scores: any;
  created_at: string;
  client_name?: string;
}

const REASONS = [
  { value: "goals_met", label: "Goals Met" },
  { value: "client_request", label: "Client Request" },
  { value: "referral", label: "Referral to Another Specialist" },
  { value: "dropout", label: "Dropout / Lost Contact" },
  { value: "other", label: "Other" },
];

const REASON_COLORS: Record<string, string> = {
  goals_met: "bg-green-500/15 text-green-700 dark:text-green-400",
  client_request: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  referral: "bg-accent/15 text-accent-foreground",
  dropout: "bg-destructive/15 text-destructive",
  other: "bg-muted text-muted-foreground",
};

interface Props {
  role: "psychologist" | "client";
}

const DischargeTab = ({ role }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [summaries, setSummaries] = useState<DischargeSummary[]>([]);
  const [clients, setClients] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form
  const [clientId, setClientId] = useState("");
  const [reason, setReason] = useState("other");
  const [progressSummary, setProgressSummary] = useState("");
  const [aftercare, setAftercare] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const col = role === "psychologist" ? "psychologist_id" : "client_id";
    const { data } = await supabase
      .from("discharge_summaries")
      .select("*")
      .eq(col, user.id)
      .order("created_at", { ascending: false });

    if (data) {
      const clientIds = [...new Set(data.map((d) => d.client_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", clientIds);
      const nameMap = new Map((profiles || []).map((p) => [p.id, p.full_name]));
      setSummaries(data.map((d) => ({ ...d, client_name: nameMap.get(d.client_id) || "Client" })));
    }
    setLoading(false);
  }, [user, role]);

  const loadClients = useCallback(async () => {
    if (!user || role !== "psychologist") return;
    const { data } = await supabase.from("sessions").select("client_id").eq("psychologist_id", user.id);
    if (data) {
      const ids = [...new Set(data.map((s) => s.client_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      setClients((profiles || []).map((p) => ({ id: p.id, full_name: p.full_name || "—" })));
    }
  }, [user, role]);

  useEffect(() => { load(); loadClients(); }, [load, loadClients]);

  const handleCreate = async () => {
    if (!user || !clientId) return;
    setSaving(true);

    // Auto-fetch initial/final assessment scores
    const { data: assessments } = await supabase
      .from("assessment_results")
      .select("total_score, completed_at, assessment:assessments(title)")
      .eq("user_id", clientId)
      .order("completed_at", { ascending: true });

    const initial = assessments?.[0] ? { score: assessments[0].total_score, date: assessments[0].completed_at } : {};
    const final = assessments && assessments.length > 1
      ? { score: assessments[assessments.length - 1].total_score, date: assessments[assessments.length - 1].completed_at }
      : {};

    const { error } = await supabase.from("discharge_summaries").insert({
      psychologist_id: user.id,
      client_id: clientId,
      reason: reason as any,
      progress_summary: progressSummary || null,
      aftercare_recommendations: aftercare || null,
      initial_scores: initial,
      final_scores: final,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Discharge summary created" });
      setOpen(false);
      setClientId(""); setReason("other"); setProgressSummary(""); setAftercare("");
      load();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <LogOut className="h-5 w-5 text-primary" />
          {role === "psychologist" ? "Discharge Summaries" : "Discharge Records"}
        </h2>
        {role === "psychologist" && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5" variant="outline"><Plus className="h-4 w-4" /> New Discharge</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Discharge Summary</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Client</Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Reason for Discharge</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {REASONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Progress Summary</Label>
                  <Textarea value={progressSummary} onChange={(e) => setProgressSummary(e.target.value)} rows={4}
                    placeholder="Summarize the client's progress throughout treatment..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Aftercare Recommendations</Label>
                  <Textarea value={aftercare} onChange={(e) => setAftercare(e.target.value)} rows={3}
                    placeholder="Maintenance strategies, follow-up frequency, referrals..." />
                </div>
                <p className="text-xs text-muted-foreground">Initial and final assessment scores will be pulled automatically.</p>
                <Button onClick={handleCreate} disabled={saving || !clientId} className="w-full">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Create Summary
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {summaries.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>No discharge summaries yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {summaries.map((ds) => (
            <Card key={ds.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {ds.client_name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={REASON_COLORS[ds.reason] || ""}>
                      {REASONS.find((r) => r.value === ds.reason)?.label || ds.reason}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(ds.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Scores comparison */}
                {(ds.initial_scores?.score || ds.final_scores?.score) && (
                  <div className="flex gap-4 text-sm">
                    {ds.initial_scores?.score != null && (
                      <span>Initial score: <strong>{ds.initial_scores.score}</strong></span>
                    )}
                    {ds.final_scores?.score != null && (
                      <span>Final score: <strong>{ds.final_scores.score}</strong></span>
                    )}
                    {ds.initial_scores?.score != null && ds.final_scores?.score != null && (
                      <Badge variant="outline" className="text-xs">
                        {ds.final_scores.score < ds.initial_scores.score ? "↓ Improved" : ds.final_scores.score === ds.initial_scores.score ? "→ Same" : "↑ Increased"}
                      </Badge>
                    )}
                  </div>
                )}
                {ds.progress_summary && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Progress Summary</p>
                    <p className="text-sm text-foreground">{ds.progress_summary}</p>
                  </div>
                )}
                {ds.aftercare_recommendations && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Aftercare</p>
                    <p className="text-sm text-foreground">{ds.aftercare_recommendations}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DischargeTab;