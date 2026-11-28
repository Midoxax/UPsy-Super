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
import { Input } from "@/components/ui/input";
import type { Telemetry } from "@/hooks/useAthleteHub";
import { usePerfCopy } from "@/lib/performance/copy";

type Submit = (
  i: {
    mood: number;
    sleep: number;
    stress: number;
    energy: number;
    cognitive_load: number;
    note?: string;
  } & Telemetry,
) => Promise<{ error: any; score?: number }>;

// Wearable / recovery fields: optional, plausible ranges as in the database.
const TELEMETRY = [
  { key: "sleep_hours", min: 0, max: 16, step: 0.5 },
  { key: "soreness", min: 1, max: 10, step: 1 },
  { key: "hrv_ms", min: 5, max: 300, step: 1 },
  { key: "resting_hr", min: 25, max: 140, step: 1 },
] as const;

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
  const pc = usePerfCopy();
  const [tele, setTele] = useState<Record<string, string>>({});
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
    const telemetry: Telemetry = {};
    for (const f of TELEMETRY) {
      const n = Number(tele[f.key]);
      if (tele[f.key] && Number.isFinite(n) && n >= f.min && n <= f.max)
        telemetry[f.key] = n;
    }
    const res = await onSubmit({
      ...values,
      ...telemetry,
      note: note.trim() || undefined,
    });
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
    setTele({});
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

          <details className="rounded-xl border border-border/60 p-3">
            <summary className="cursor-pointer text-sm font-medium text-foreground">
              {pc.telemetryFields}
            </summary>
            <p className="mt-1 text-xs text-muted-foreground">
              {pc.telemetryHint}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {TELEMETRY.map((f) => {
                const label = {
                  sleep_hours: pc.sleepHours,
                  soreness: `${pc.soreness} (1-10)`,
                  hrv_ms: pc.hrvMs,
                  resting_hr: pc.restingHr,
                }[f.key];
                return (
                  <label key={f.key} className="space-y-1 text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={tele[f.key] ?? ""}
                      onChange={(e) =>
                        setTele((t) => ({ ...t, [f.key]: e.target.value }))
                      }
                    />
                  </label>
                );
              })}
            </div>
          </details>

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
