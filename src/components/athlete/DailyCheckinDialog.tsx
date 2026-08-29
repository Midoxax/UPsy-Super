import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { computeReadinessScore } from "@/hooks/useAthleteHub";

type Submit = (i: { mood: number; sleep: number; stress: number; energy: number; cognitive_load: number; note?: string }) => Promise<{ error: any; score?: number }>;

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: Submit;
}

const FIELDS: Array<{ key: "mood" | "sleep" | "stress" | "energy" | "cognitive_load"; label: string; lo: string; hi: string }> = [
  { key: "mood", label: "Mood", lo: "Flat", hi: "Vibrant" },
  { key: "sleep", label: "Sleep quality", lo: "Restless", hi: "Restorative" },
  { key: "stress", label: "Stress level", lo: "Calm", hi: "Overloaded" },
  { key: "energy", label: "Physical energy", lo: "Depleted", hi: "Charged" },
  { key: "cognitive_load", label: "Cognitive load", lo: "Clear", hi: "Foggy" },
];

export default function DailyCheckinDialog({ open, onOpenChange, onSubmit }: Props) {
  const [values, setValues] = useState({ mood: 7, sleep: 7, stress: 4, energy: 7, cognitive_load: 4 });
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const preview = computeReadinessScore(values);

  const handle = async () => {
    setSubmitting(true);
    const res = await onSubmit({ ...values, note: note.trim() || undefined });
    setSubmitting(false);
    if (res.error) {
      toast({ title: "Could not save check-in", description: res.error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Check-in saved", description: `Readiness score: ${res.score}` });
    onOpenChange(false);
    setNote("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Daily readiness check-in</DialogTitle>
          <DialogDescription>Takes about 30 seconds. Used to track trends, never shared.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <div className="flex items-baseline justify-between mb-2">
                <label className="text-sm font-medium text-foreground">{f.label}</label>
                <span className="text-sm tabular-nums text-muted-foreground">{(values as any)[f.key]}/10</span>
              </div>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[(values as any)[f.key]]}
                onValueChange={(v) => setValues((s) => ({ ...s, [f.key]: v[0] }))}
              />
              <div className="flex justify-between mt-1">
                <span className="text-[11px] text-muted-foreground">{f.lo}</span>
                <span className="text-[11px] text-muted-foreground">{f.hi}</span>
              </div>
            </div>
          ))}

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Note (optional)</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything worth remembering about today?"
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="glass-card p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Projected readiness</span>
            <span className="text-2xl font-bold text-primary tabular-nums">{preview}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button variant="primary" onClick={handle} disabled={submitting}>
            {submitting ? "Saving…" : "Save check-in"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}