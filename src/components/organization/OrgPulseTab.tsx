import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Activity, Lock, Plus, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const OrgPulseTab = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { data: org } = useQuery({
    queryKey: ["org-account-pulse", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("organization_accounts")
        .select("id, name")
        .eq("owner_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: surveys } = useQuery({
    queryKey: ["org-pulse-surveys", org?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("org_pulse_surveys")
        .select("*")
        .eq("org_id", org!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!org?.id,
  });

  const { data: aggregate } = useQuery({
    queryKey: ["org-pulse-aggregate", org?.id],
    queryFn: async () => {
      const { data } = await supabase.rpc("org_pulse_aggregate", { _org_id: org!.id });
      return data as any;
    },
    enabled: !!org?.id,
  });

  const createSurvey = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("org_pulse_surveys").insert({
        org_id: org!.id,
        title,
        description,
        status: "active",
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pulse survey launched");
      setOpen(false);
      setTitle("");
      setDescription("");
      qc.invalidateQueries({ queryKey: ["org-pulse-surveys", org?.id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const closeSurvey = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("org_pulse_surveys").update({ status: "closed", ends_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Survey closed");
      qc.invalidateQueries({ queryKey: ["org-pulse-surveys", org?.id] });
    },
  });

  const kThresholdMet = aggregate?.k_threshold_met;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Wellbeing Pulse</h3>
          <p className="text-sm text-muted-foreground">Anonymous employee surveys with k-anonymity (≥5 responses required).</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Launch Pulse</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Pulse Survey</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Title (e.g. Q2 Wellbeing Check-in)" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="Brief description for employees" value={description} onChange={(e) => setDescription(e.target.value)} />
              <div className="rounded-lg bg-muted/30 p-3 text-xs flex gap-2">
                <Lock className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Responses are fully anonymous. No individual data is exposed — aggregates appear only after 5+ responses.</span>
              </div>
              <Button onClick={() => createSurvey.mutate()} disabled={!title || createSurvey.isPending} className="w-full">
                {createSurvey.isPending ? "Launching…" : "Launch Survey"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Aggregate snapshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{aggregate?.response_count ?? 0}</p>
            <p className="text-xs text-muted-foreground">Total responses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Activity className="h-5 w-5 mx-auto mb-1 text-chart-2" />
            <p className="text-2xl font-bold">{kThresholdMet ? aggregate.avg_mood : "—"}</p>
            <p className="text-xs text-muted-foreground">Avg mood (1–5)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-chart-4" />
            <p className="text-2xl font-bold">{kThresholdMet ? aggregate.avg_stress : "—"}</p>
            <p className="text-xs text-muted-foreground">Avg stress (1–5)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Lock className="h-5 w-5 mx-auto mb-1 text-accent" />
            <p className="text-2xl font-bold">{kThresholdMet ? `${aggregate.wellbeing_index}` : "—"}</p>
            <p className="text-xs text-muted-foreground">Wellbeing index</p>
          </CardContent>
        </Card>
      </div>

      {!kThresholdMet && (aggregate?.response_count ?? 0) > 0 && (
        <Card className="border-chart-4/40 bg-chart-4/5">
          <CardContent className="pt-4 flex gap-3 items-start">
            <Lock className="h-5 w-5 text-chart-4 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Privacy threshold not yet reached</p>
              <p className="text-muted-foreground text-xs mt-1">
                Aggregates will appear once at least 5 employees have responded. Currently: {aggregate?.response_count ?? 0}.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active & past surveys</CardTitle>
          <CardDescription>{surveys?.length ?? 0} survey(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {surveys?.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                <div>
                  <p className="font-medium text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(s.created_at!).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={s.status === "active" ? "bg-chart-2/10 text-chart-2 border-chart-2/20" : "bg-muted"}>
                    {s.status}
                  </Badge>
                  {s.status === "active" && (
                    <Button variant="ghost" size="sm" onClick={() => closeSurvey.mutate(s.id)}>Close</Button>
                  )}
                </div>
              </div>
            ))}
            {(!surveys || surveys.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-6">No surveys yet — launch your first pulse to gather anonymous wellbeing signals.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgPulseTab;
