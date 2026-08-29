import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  ClipboardList, Plus, Loader2, Target, Trash2, CheckCircle2,
  Calendar, User, RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

interface Goal {
  description: string;
  target_date?: string;
  status: "pending" | "in_progress" | "achieved";
  notes?: string;
}

interface TreatmentPlan {
  id: string;
  client_id: string;
  presenting_problems: string[];
  goals: Goal[];
  interventions: string[];
  estimated_sessions: number | null;
  status: string;
  review_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client_profile?: { full_name: string | null } | null;
}

interface ClientOption {
  id: string;
  full_name: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-primary/15 text-primary",
  revised: "bg-accent/15 text-accent-foreground",
  completed: "bg-green-500/15 text-green-700 dark:text-green-400",
};

const INTERVENTION_OPTIONS = [
  "CBT", "Schema Therapy", "EMDR", "ACT", "DBT",
  "Psychodynamic", "Motivational Interviewing", "Mindfulness-Based",
  "Solution-Focused", "Narrative Therapy",
];

const TreatmentPlansTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [clientId, setClientId] = useState("");
  const [problems, setProblems] = useState<string[]>([""]);
  const [goals, setGoals] = useState<Goal[]>([{ description: "", status: "pending" }]);
  const [interventions, setInterventions] = useState<string[]>([]);
  const [estimatedSessions, setEstimatedSessions] = useState("");
  const [reviewAt, setReviewAt] = useState("");
  const [planNotes, setPlanNotes] = useState("");
  const [planStatus, setPlanStatus] = useState<string>("draft");

  const loadPlans = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("treatment_plans")
      .select("*")
      .eq("psychologist_id", user.id)
      .order("updated_at", { ascending: false });

    if (data) {
      // Fetch client names
      const clientIds = [...new Set(data.map((p) => p.client_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", clientIds);
      const nameMap = new Map((profiles || []).map((p) => [p.id, p.full_name]));
      setPlans(
        data.map((p) => ({
          ...p,
          presenting_problems: (p.presenting_problems as any) || [],
          goals: (p.goals as any) || [],
          client_profile: { full_name: nameMap.get(p.client_id) || "Unknown" },
        }))
      );
    }
    setLoading(false);
  }, [user]);

  const loadClients = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("sessions")
      .select("client_id")
      .eq("psychologist_id", user.id);
    if (data) {
      const ids = [...new Set(data.map((s) => s.client_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", ids);
      setClients((profiles || []).map((p) => ({ id: p.id, full_name: p.full_name || "—" })));
    }
  }, [user]);

  useEffect(() => { loadPlans(); loadClients(); }, [loadPlans, loadClients]);

  const resetForm = () => {
    setClientId("");
    setProblems([""]);
    setGoals([{ description: "", status: "pending" }]);
    setInterventions([]);
    setEstimatedSessions("");
    setReviewAt("");
    setPlanNotes("");
    setPlanStatus("draft");
    setEditId(null);
  };

  const openEdit = (plan: TreatmentPlan) => {
    setEditId(plan.id);
    setClientId(plan.client_id);
    setProblems(plan.presenting_problems.length ? plan.presenting_problems : [""]);
    setGoals(plan.goals.length ? plan.goals : [{ description: "", status: "pending" }]);
    setInterventions(plan.interventions || []);
    setEstimatedSessions(plan.estimated_sessions?.toString() || "");
    setReviewAt(plan.review_at ? plan.review_at.split("T")[0] : "");
    setPlanNotes(plan.notes || "");
    setPlanStatus(plan.status);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!user || !clientId) return;
    setSaving(true);
    const payload = {
      psychologist_id: user.id,
      client_id: clientId,
      presenting_problems: problems.filter(Boolean),
      goals: goals.filter((g) => g.description) as any,
      interventions,
      estimated_sessions: estimatedSessions ? parseInt(estimatedSessions) : null,
      review_at: reviewAt || null,
      notes: planNotes || null,
      status: planStatus as any,
    };

    const result = editId
      ? await supabase.from("treatment_plans").update(payload).eq("id", editId)
      : await supabase.from("treatment_plans").insert(payload);

    setSaving(false);
    if (result.error) {
      toast({ title: "Error", description: result.error.message, variant: "destructive" });
    } else {
      toast({ title: editId ? "Plan updated" : "Plan created" });
      setOpen(false);
      resetForm();
      loadPlans();
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
          <ClipboardList className="h-5 w-5 text-primary" />
          Treatment Plans
        </h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit Treatment Plan" : "New Treatment Plan"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 pt-2">
              {/* Client */}
              <div className="space-y-1.5">
                <Label>Client</Label>
                <Select value={clientId} onValueChange={setClientId} disabled={!!editId}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={planStatus} onValueChange={setPlanStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="revised">Revised</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Presenting Problems */}
              <div className="space-y-2">
                <Label>Presenting Problems</Label>
                {problems.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={p}
                      onChange={(e) => { const n = [...problems]; n[i] = e.target.value; setProblems(n); }}
                      placeholder={`Problem ${i + 1}`}
                    />
                    {problems.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => setProblems(problems.filter((_, j) => j !== i))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setProblems([...problems, ""])}>
                  <Plus className="h-3 w-3 mr-1" /> Add problem
                </Button>
              </div>

              {/* SMART Goals */}
              <div className="space-y-3">
                <Label>Therapeutic Goals (SMART)</Label>
                {goals.map((g, i) => (
                  <Card key={i} className="p-3 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={g.description}
                        onChange={(e) => { const n = [...goals]; n[i] = { ...n[i], description: e.target.value }; setGoals(n); }}
                        placeholder="Goal description"
                        className="flex-1"
                      />
                      <Select
                        value={g.status}
                        onValueChange={(v) => { const n = [...goals]; n[i] = { ...n[i], status: v as Goal["status"] }; setGoals(n); }}
                      >
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="achieved">Achieved</SelectItem>
                        </SelectContent>
                      </Select>
                      {goals.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => setGoals(goals.filter((_, j) => j !== i))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={g.target_date || ""}
                        onChange={(e) => { const n = [...goals]; n[i] = { ...n[i], target_date: e.target.value }; setGoals(n); }}
                        className="w-44"
                      />
                      <Input
                        value={g.notes || ""}
                        onChange={(e) => { const n = [...goals]; n[i] = { ...n[i], notes: e.target.value }; setGoals(n); }}
                        placeholder="Notes"
                        className="flex-1"
                      />
                    </div>
                  </Card>
                ))}
                <Button variant="outline" size="sm" onClick={() => setGoals([...goals, { description: "", status: "pending" }])}>
                  <Plus className="h-3 w-3 mr-1" /> Add goal
                </Button>
              </div>

              {/* Interventions */}
              <div className="space-y-2">
                <Label>Interventions / Approaches</Label>
                <div className="flex flex-wrap gap-2">
                  {INTERVENTION_OPTIONS.map((opt) => (
                    <Badge
                      key={opt}
                      variant={interventions.includes(opt) ? "default" : "outline"}
                      className="cursor-pointer select-none"
                      onClick={() =>
                        setInterventions((prev) =>
                          prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]
                        )
                      }
                    >
                      {opt}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Estimated sessions + review date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Estimated Sessions</Label>
                  <Input type="number" min="1" value={estimatedSessions} onChange={(e) => setEstimatedSessions(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Next Review Date</Label>
                  <Input type="date" value={reviewAt} onChange={(e) => setReviewAt(e.target.value)} />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label>Clinical Notes</Label>
                <Textarea value={planNotes} onChange={(e) => setPlanNotes(e.target.value)} rows={3} />
              </div>

              <Button onClick={handleSave} disabled={saving || !clientId} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editId ? "Update Plan" : "Create Plan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {plans.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>No treatment plans yet. Create one after completing intake.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openEdit(plan)}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {plan.client_profile?.full_name || "Client"}
                  </CardTitle>
                  <Badge className={STATUS_COLORS[plan.status] || ""}>{plan.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {plan.presenting_problems.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {plan.presenting_problems.map((p, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {plan.goals.filter((g: Goal) => g.status === "achieved").length}/{plan.goals.length} goals achieved
                  </span>
                  {plan.interventions?.length > 0 && (
                    <span>{plan.interventions.join(", ")}</span>
                  )}
                  {plan.review_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Review: {format(new Date(plan.review_at), "MMM d")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TreatmentPlansTab;