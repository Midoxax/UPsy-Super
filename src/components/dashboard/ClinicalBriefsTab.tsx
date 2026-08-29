import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IntakeRow {
  id: string;
  client_id: string;
  status: string;
  phq9_score: number | null;
  phq9_severity: string | null;
  gad7_score: number | null;
  gad7_severity: string | null;
  pss10_score: number | null;
  pss10_severity: string | null;
  clinical_flags: string[] | null;
  completion_pct: number | null;
  completed_at: string | null;
  shared_with_psy_at: string | null;
  presenting_complaint: Record<string, any>;
  objectives_consent: Record<string, any>;
  identity: Record<string, any>;
}

interface ClinicalBrief {
  id: string;
  anamnesis_id: string;
  summary_text: string;
  risk_level: string;
  suggested_approaches: string[];
  key_themes: string[];
  created_at: string;
}

const severityColor = (s: string | null) => {
  if (!s) return "secondary";
  const l = s.toLowerCase();
  if (l.includes("severe") || l.includes("sévère")) return "destructive";
  if (l.includes("moderate") || l.includes("modéré")) return "default";
  return "secondary";
};

const ClinicalBriefsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [intakes, setIntakes] = useState<IntakeRow[]>([]);
  const [briefs, setBriefs] = useState<Record<string, ClinicalBrief>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      // Fetch completed intakes for this psychologist's clients
      const { data: rows } = await supabase
        .from("client_anamneses")
        .select("*")
        .eq("psychologist_id", user.id)
        .in("status", ["completed", "reviewed"])
        .order("completed_at", { ascending: false })
        .limit(50);

      if (rows) setIntakes(rows as any);

      // Fetch existing briefs
      const { data: briefRows } = await supabase
        .from("intake_clinical_briefs")
        .select("*")
        .eq("psychologist_id", user.id)
        .order("created_at", { ascending: false });

      if (briefRows) {
        const map: Record<string, ClinicalBrief> = {};
        briefRows.forEach((b: any) => { map[b.anamnesis_id] = b; });
        setBriefs(map);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const generateBrief = async (intakeId: string) => {
    setGenerating(intakeId);
    try {
      const { data, error } = await supabase.functions.invoke("generate-clinical-brief", {
        body: { anamnesis_id: intakeId },
      });
      if (error) throw error;
      if (data?.brief) {
        setBriefs((prev) => ({ ...prev, [intakeId]: data.brief }));
        toast({ title: "Brief generated", description: "AI clinical brief is ready." });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to generate brief.", variant: "destructive" });
    } finally {
      setGenerating(null);
    }
  };

  const getClientName = (intake: IntakeRow) => {
    const id = intake.identity || {};
    return [id.first_name, id.last_name].filter(Boolean).join(" ") || intake.client_id?.slice(0, 8);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  if (intakes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Brain className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No completed intakes yet</p>
          <p className="text-xs mt-1">Clinical briefs will appear here once clients complete their intake forms.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Clinical Briefs</h3>
        <Badge variant="outline">{intakes.length} intake{intakes.length !== 1 ? "s" : ""}</Badge>
      </div>

      {intakes.map((intake) => {
        const brief = briefs[intake.id];
        const isExpanded = expanded === intake.id;
        const flags = intake.clinical_flags || [];

        return (
          <Card key={intake.id} className={flags.length > 0 ? "border-destructive/30" : ""}>
            <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : intake.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm">{getClientName(intake)}</CardTitle>
                  {flags.length > 0 && <AlertTriangle className="h-4 w-4 text-destructive" />}
                  <Badge variant="outline" className="text-[10px]">{intake.status}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  {intake.completed_at && (
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(intake.completed_at).toLocaleDateString()}
                    </span>
                  )}
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="space-y-4">
                {/* Scores */}
                <div className="grid grid-cols-3 gap-2">
                  {intake.phq9_score != null && (
                    <div className="rounded-lg border p-2 text-center">
                      <div className="text-[10px] text-muted-foreground">PHQ-9</div>
                      <div className="text-lg font-bold">{intake.phq9_score}</div>
                      <Badge variant={severityColor(intake.phq9_severity)} className="text-[9px]">{intake.phq9_severity}</Badge>
                    </div>
                  )}
                  {intake.gad7_score != null && (
                    <div className="rounded-lg border p-2 text-center">
                      <div className="text-[10px] text-muted-foreground">GAD-7</div>
                      <div className="text-lg font-bold">{intake.gad7_score}</div>
                      <Badge variant={severityColor(intake.gad7_severity)} className="text-[9px]">{intake.gad7_severity}</Badge>
                    </div>
                  )}
                  {intake.pss10_score != null && (
                    <div className="rounded-lg border p-2 text-center">
                      <div className="text-[10px] text-muted-foreground">PSS-10</div>
                      <div className="text-lg font-bold">{intake.pss10_score}</div>
                      <Badge variant={severityColor(intake.pss10_severity)} className="text-[9px]">{intake.pss10_severity}</Badge>
                    </div>
                  )}
                </div>

                {/* Clinical flags */}
                {flags.length > 0 && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <p className="text-xs font-medium text-destructive mb-1">Clinical Flags</p>
                    <div className="flex flex-wrap gap-1">
                      {flags.map((f) => (
                        <Badge key={f} variant="destructive" className="text-[9px]">{f.replace(/_/g, " ")}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Presenting complaint summary */}
                {intake.presenting_complaint?.main_reason && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Presenting Complaint</p>
                    <p className="text-sm">{intake.presenting_complaint.main_reason}</p>
                  </div>
                )}

                {/* Therapy goals */}
                {intake.objectives_consent?.therapy_goals && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Client Goals</p>
                    <p className="text-sm">{intake.objectives_consent.therapy_goals}</p>
                  </div>
                )}

                {/* AI Brief */}
                {brief ? (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold">AI Clinical Brief</span>
                      <Badge variant="outline" className="text-[9px] ml-auto">
                        {new Date(brief.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{brief.summary_text}</p>
                    {brief.key_themes?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">Key Themes</p>
                        <div className="flex flex-wrap gap-1">
                          {brief.key_themes.map((t) => <Badge key={t} variant="secondary" className="text-[9px]">{t}</Badge>)}
                        </div>
                      </div>
                    )}
                    {brief.suggested_approaches?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">Suggested Approaches</p>
                        <div className="flex flex-wrap gap-1">
                          {brief.suggested_approaches.map((a) => <Badge key={a} variant="outline" className="text-[9px]">{a}</Badge>)}
                        </div>
                      </div>
                    )}
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => generateBrief(intake.id)}>
                      <RefreshCw className="h-3 w-3 mr-1" /> Regenerate
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => generateBrief(intake.id)}
                    disabled={generating === intake.id}
                  >
                    {generating === intake.id ? (
                      <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generating…</>
                    ) : (
                      <><Brain className="h-3 w-3 mr-1" /> Generate AI Brief</>
                    )}
                  </Button>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default ClinicalBriefsTab;