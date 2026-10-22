import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { computeReadinessScore } from "@/hooks/useAthleteHub";
import { useHubCopy } from "@/components/athlete/copy";

type Submit = (i: {
  mood: number;
  sleep: number;
  stress: number;
  energy: number;
  cognitive_load: number;
  note?: string;
}) => Promise<{ error: any; score?: number }>;

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: Submit;
}

const FIELDS = ["mood", "sleep", "stress", "energy", "cognitive_load"] as const;

export default function DailyCheckinDialog({
  open,
  onOpenChange,
  onSubmit,
}: Props) {
  const c = useHubCopy();
  const [values, setValues] = useState({
    mood: 7,
    sleep: 7,
    stress: 4,
    energy: 7,
    cognitive_load: 4,
  });
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const preview = computeReadinessScore(values);

  const handle = async () => {
    setSubmitting(true);
    const res = await onSubmit({ ...values, note: note.trim() || undefined });
    setSubmitting(false);
    if (res.error) {
      toast({
        title: c.saveFailed,
        description: res.error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: c.checkinSaved,
      description: `${c.scoreIs}: ${res.score}`,
    });
    onOpenChange(false);
    setNote("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{c.checkinTitle}</DialogTitle>
          <DialogDescription>{c.checkinDesc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {FIELDS.map((key) => {
            const [label, lo, hi] = c.fields[key];
            return (
              <div key={key}>
                <div className="flex items-baseline justify-between mb-2">
                  <label
                    id={`checkin-${key}`}
                    className="text-sm font-medium text-foreground"
                  >
                    {label}
                  </label>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {values[key]}/10
                  </span>
                </div>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  aria-labelledby={`checkin-${key}`}
                  value={[values[key]]}
                  onValueChange={(v) =>
                    setValues((s) => ({ ...s, [key]: v[0] }))
                  }
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[11px] text-muted-foreground">
                    {lo}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {hi}
                  </span>
                </div>
              </div>
            );
          })}

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {c.note}
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={c.notePlaceholder}
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="glass-card p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{c.projected}</span>
            <span className="text-2xl font-bold text-primary tabular-nums">
              {preview}
            </span>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {c.cancel}
          </Button>
          <Button variant="primary" onClick={handle} disabled={submitting}>
            {submitting ? c.saving : c.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
