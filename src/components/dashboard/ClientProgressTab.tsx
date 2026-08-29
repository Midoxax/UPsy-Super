import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, TrendingUp, Activity, Target, Calendar } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { format } from "date-fns";

interface Props {
  role: "psychologist" | "client";
}

const ClientProgressTab = ({ role }: Props) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<{ id: string; full_name: string }[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [moodData, setMoodData] = useState<any[]>([]);
  const [assessmentData, setAssessmentData] = useState<any[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [goalStats, setGoalStats] = useState({ total: 0, achieved: 0 });
  const [loading, setLoading] = useState(true);

  const targetId = role === "client" ? user?.id : selectedClient;

  const loadClients = useCallback(async () => {
    if (!user || role !== "psychologist") return;
    const { data } = await supabase.from("sessions").select("client_id").eq("psychologist_id", user.id);
    if (data) {
      const ids = [...new Set(data.map((s) => s.client_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      const list = (profiles || []).map((p) => ({ id: p.id, full_name: p.full_name || "—" }));
      setClients(list);
      if (list.length > 0 && !selectedClient) setSelectedClient(list[0].id);
    }
  }, [user, role, selectedClient]);

  const loadProgress = useCallback(async () => {
    if (!targetId) { setLoading(false); return; }
    setLoading(true);

    const [moodRes, assessRes, sessRes, planRes] = await Promise.all([
      supabase.from("mood_entries").select("mood_score, stress_level, recorded_at")
        .eq("user_id", targetId).order("recorded_at", { ascending: true }).limit(60),
      supabase.from("assessment_results").select("total_score, completed_at, assessment:assessments(title)")
        .eq("user_id", targetId).order("completed_at", { ascending: true }).limit(20),
      supabase.from("sessions").select("id")
        .eq("client_id", targetId).eq("status", "completed"),
      supabase.from("treatment_plans").select("goals")
        .eq("client_id", targetId),
    ]);

    setMoodData(
      (moodRes.data || []).map((m) => ({
        date: format(new Date(m.recorded_at ?? 0), "MMM d"),
        mood: m.mood_score,
        stress: m.stress_level,
      }))
    );

    setAssessmentData(
      (assessRes.data || []).map((a: any) => ({
        date: a.completed_at ? format(new Date(a.completed_at), "MMM d") : "",
        score: a.total_score,
        label: a.assessment?.title || "Assessment",
      }))
    );

    setSessionCount(sessRes.data?.length || 0);

    const allGoals = (planRes.data || []).flatMap((p) => (p.goals as any[]) || []);
    setGoalStats({
      total: allGoals.length,
      achieved: allGoals.filter((g: any) => g.status === "achieved").length,
    });

    setLoading(false);
  }, [targetId]);

  useEffect(() => { loadClients(); }, [loadClients]);
  useEffect(() => { loadProgress(); }, [loadProgress]);

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
          <TrendingUp className="h-5 w-5 text-primary" />
          {role === "psychologist" ? "Client Progress" : "My Progress"}
        </h2>
        {role === "psychologist" && clients.length > 0 && (
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-52"><SelectValue placeholder="Select client" /></SelectTrigger>
            <SelectContent>
              {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <Calendar className="h-5 w-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{sessionCount}</p>
          <p className="text-xs text-muted-foreground">Sessions completed</p>
        </Card>
        <Card className="p-4 text-center">
          <Target className="h-5 w-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{goalStats.achieved}/{goalStats.total}</p>
          <p className="text-xs text-muted-foreground">Goals achieved</p>
        </Card>
        <Card className="p-4 text-center">
          <Activity className="h-5 w-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{moodData.length}</p>
          <p className="text-xs text-muted-foreground">Mood check-ins</p>
        </Card>
        <Card className="p-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{assessmentData.length}</p>
          <p className="text-xs text-muted-foreground">Assessments taken</p>
        </Card>
      </div>

      {/* Mood chart */}
      {moodData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Mood & Stress Trajectory</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Area type="monotone" dataKey="mood" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" name="Mood" />
                <Area type="monotone" dataKey="stress" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive) / 0.1)" name="Stress" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Assessment score chart */}
      {assessmentData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Assessment Score Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={assessmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} name="Score" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {moodData.length === 0 && assessmentData.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>No progress data yet. Mood check-ins and assessments will appear here.</p>
        </Card>
      )}
    </div>
  );
};

export default ClientProgressTab;