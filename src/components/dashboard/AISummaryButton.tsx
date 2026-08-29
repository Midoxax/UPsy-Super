import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertTriangle, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useHasFeature } from "@/hooks/useSpecialistPlan";
import { Link } from "@/lib/router-compat";

interface SummaryResult {
  summary: string;
  themes: string[];
  interventions: string[];
  progress: string;
  next_steps: string[];
  risk_flags: string[];
}

const AISummaryButton = ({ notes }: { notes: string }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const { has, isLoading: planLoading } = useHasFeature("ai_session_summary");

  const generate = async () => {
    if (!has) {
      toast.error("AI summaries are a Pro/Elite feature.", {
        action: { label: "Upgrade", onClick: () => (window.location.href = "/my-space?tab=plans") },
      });
      return;
    }
    if (!notes || notes.trim().length < 10) {
      toast.error("Notes are too short to summarize.");
      return;
    }
    setLoading(true);
    setOpen(true);
    try {
      const { data, error } = await supabase.functions.invoke("session-summary", {
        body: { notes },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not generate summary");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {has || planLoading ? (
        <Button variant="outline" size="sm" onClick={generate} className="gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          AI summary
        </Button>
      ) : (
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link to="/my-space?tab=plans">
            <Lock className="h-3.5 w-3.5" />
            AI summary · Pro
          </Link>
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI clinical summary
            </DialogTitle>
          </DialogHeader>

          {loading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Drafting summary…
            </div>
          )}

          {result && !loading && (
            <div className="space-y-5 pt-2">
              {result.risk_flags.length > 0 && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
                  <div className="flex items-center gap-2 text-destructive font-medium text-sm mb-1">
                    <AlertTriangle className="h-4 w-4" /> Risk indicators
                  </div>
                  <ul className="text-sm text-foreground list-disc pl-5">
                    {result.risk_flags.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}

              <section>
                <h4 className="text-sm font-semibold text-foreground mb-1">Summary</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
              </section>

              <section>
                <h4 className="text-sm font-semibold text-foreground mb-2">Themes</h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.themes.map((t, i) => (
                    <Badge key={i} variant="secondary">{t}</Badge>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-sm font-semibold text-foreground mb-2">Interventions used</h4>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-0.5">
                  {result.interventions.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </section>

              <section>
                <h4 className="text-sm font-semibold text-foreground mb-1">Progress</h4>
                <p className="text-sm text-muted-foreground">{result.progress}</p>
              </section>

              <section>
                <h4 className="text-sm font-semibold text-foreground mb-2">Suggested next steps</h4>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-0.5">
                  {result.next_steps.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </section>

              <p className="text-xs text-muted-foreground italic border-t pt-3">
                AI-generated draft. Always review and edit before saving as a clinical record.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AISummaryButton;
