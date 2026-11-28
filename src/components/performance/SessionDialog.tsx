import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { isoDay } from "@/lib/performance/metrics";
import type { PerfCopy } from "@/lib/performance/copy";
import type { Session } from "@/hooks/usePerformance";

const KINDS = [
  "training",
  "match",
  "strength",
  "conditioning",
  "recovery",
  "mental",
  "other",
] as const;

/** Log a session with its session RPE (CR-10): load = minutes x effort. */
export default function SessionDialog({
  c,
  open,
  onOpenChange,
  onSave,
}: {
  c: PerfCopy;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (s: Omit<Session, "id" | "load">) => Promise<{ error: Error | null }>;
}) {
  const [date, setDate] = useState(isoDay(new Date()));
  const [kind, setKind] = useState<string>("training");
  const [minutes, setMinutes] = useState("60");
  const [rpe, setRpe] = useState(5);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const mins = Math.min(600, Math.max(1, Number(minutes) || 0));

  const save = async () => {
    setBusy(true);
    const { error } = await onSave({
      session_date: date,
      kind,
      duration_minutes: mins,
      rpe,
      note: note.trim() || null,
    });
    setBusy(false);
    if (error) return toast.error(c.saveFailed, { description: error.message });
    toast.success(c.saved, { description: c.loadPreview(mins * rpe) });
    setNote("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{c.sessionTitle}</DialogTitle>
          <DialogDescription>{c.sessionDesc}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 text-sm">
              <span className="font-medium">{c.date}</span>
              <Input
                type="date"
                value={date}
                max={isoDay(new Date())}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">{c.duration}</span>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={600}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </label>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">{c.kind}</p>
            <div className="flex flex-wrap gap-2">
              {KINDS.map((k) => (
                <Button
                  key={k}
                  type="button"
                  size="sm"
                  variant={kind === k ? "default" : "outline"}
                  onClick={() => setKind(k)}
                >
                  {c.kinds[k]}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <span id="rpe-label" className="text-sm font-medium">
                {c.rpe}
              </span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {rpe} · {c.rpeAnchors[rpe]}
              </span>
            </div>
            <Slider
              min={0}
              max={10}
              step={1}
              aria-labelledby="rpe-label"
              value={[rpe]}
              onValueChange={(v) => setRpe(v[0])}
            />
          </div>
          <Input
            value={note}
            maxLength={500}
            placeholder={c.notePh}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <span className="text-sm text-muted-foreground">
              {mins} × {rpe}
            </span>
            <span className="text-xl font-bold tabular-nums text-primary">
              {c.loadPreview(mins * rpe)}
            </span>
          </div>
        </div>
        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button variant="primary" onClick={save} disabled={busy}>
            {busy ? c.saving : c.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
