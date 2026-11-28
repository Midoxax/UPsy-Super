import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  anxietyRead,
  sortedRoutine,
  zoneCheck,
  type PreState,
  type RacePlan,
} from "@/lib/performance/metrics";
import type { PerfCopy } from "@/lib/performance/copy";
import type { Competition } from "@/hooks/useAthleteHub";

type Debrief = Record<string, string | number>;
export type RaceView = "plan" | "pre" | "debrief";

function Scale({
  id,
  label,
  value,
  min = 1,
  max = 10,
  ends,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  ends?: [string, string];
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span id={id} className="text-sm font-medium">
          {label}
        </span>
        <span className="text-sm tabular-nums text-muted-foreground" dir="ltr">
          {value > 0 && min < 0 ? `+${value}` : value}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={1}
        aria-labelledby={id}
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
      />
      {ends && (
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
          <span>{ends[0]}</span>
          <span>{ends[1]}</span>
        </div>
      )}
    </div>
  );
}

/**
 * One competition's race control: the plan (IZOF zone, timed routine,
 * if-then plans, cue words, process focus), the pre-race check (intensity
 * and direction) and the after-action review.
 */
export default function RacePlanDialog({
  c,
  competition,
  view,
  onOpenChange,
  onSave,
}: {
  c: PerfCopy;
  competition: Competition | null;
  view: RaceView;
  onOpenChange: (o: boolean) => void;
  onSave: (
    id: string,
    patch: Partial<Competition>,
  ) => Promise<{ error: Error | null }>;
}) {
  const [tab, setTab] = useState<RaceView>(view);
  const [plan, setPlan] = useState<RacePlan>({});
  const [state, setState] = useState<PreState>({});
  const [debrief, setDebrief] = useState<Debrief>({});
  const [result, setResult] = useState("");
  const [rating, setRating] = useState(6);
  const [cues, setCues] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!competition) return;
    setTab(view);
    const p = (competition.race_plan ?? {}) as RacePlan;
    setPlan({
      zone_low: p.zone_low ?? 5,
      zone_high: p.zone_high ?? 7,
      routine: p.routine?.length
        ? p.routine
        : c.routineTemplate.map(([at, label]) => ({ at, label })),
      if_then: p.if_then ?? [],
      cues: p.cues ?? [],
      focus: p.focus ?? "",
    });
    setCues((p.cues ?? []).join(", "));
    setState(
      competition.pre_state ?? {
        cognitive: 5,
        somatic: 5,
        confidence: 6,
        activation: 6,
        direction: 0,
      },
    );
    setDebrief(competition.debrief ?? { controllables: 6 });
    setResult(competition.result ?? "");
    setRating(competition.performance_rating ?? 6);
  }, [competition, view, c.routineTemplate]);

  if (!competition) return null;

  const save = async () => {
    setBusy(true);
    const cleanPlan: RacePlan = {
      ...plan,
      routine: sortedRoutine(plan)
        .filter((r) => r.label.trim())
        .map((r) => ({ ...r, at: Math.max(0, Math.round(r.at)) })),
      if_then: (plan.if_then ?? []).filter((x) => x.if.trim() || x.then.trim()),
      cues: cues
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 6),
    };
    const patch: Partial<Competition> =
      tab === "plan"
        ? { race_plan: cleanPlan }
        : tab === "pre"
          ? {
              pre_state: { ...state, at: new Date().toISOString() } as PreState,
            }
          : {
              debrief,
              result: result.trim() || null,
              performance_rating: rating,
              reflection:
                [debrief.keep, debrief.change]
                  .filter(Boolean)
                  .join(" · ")
                  .slice(0, 4000) || competition.reflection,
            };
    const { error } = await onSave(competition.id, patch);
    setBusy(false);
    if (error) return toast.error(c.saveFailed, { description: error.message });
    toast.success(c.saved);
    onOpenChange(false);
  };

  const routine = plan.routine ?? [];
  const ifThen = plan.if_then ?? [];
  const z = zoneCheck(plan, state);
  const dir = anxietyRead(state);

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{competition.name}</DialogTitle>
          <DialogDescription>{c.raceIntro}</DialogDescription>
        </DialogHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(v as RaceView)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plan">{c.plan}</TabsTrigger>
            <TabsTrigger value="pre">{c.preRace}</TabsTrigger>
            <TabsTrigger value="debrief">{c.debrief}</TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="space-y-6 pt-4">
            <section className="space-y-3">
              <h4 className="font-semibold">{c.zoneTitle}</h4>
              <p className="text-xs text-muted-foreground">{c.zoneHint}</p>
              <div className="grid grid-cols-2 gap-4">
                <Scale
                  id="zone-low"
                  label={c.zoneLow}
                  value={plan.zone_low ?? 5}
                  onChange={(n) =>
                    setPlan((p) => ({
                      ...p,
                      zone_low: n,
                      zone_high: Math.max(n, p.zone_high ?? n),
                    }))
                  }
                />
                <Scale
                  id="zone-high"
                  label={c.zoneHigh}
                  value={plan.zone_high ?? 7}
                  onChange={(n) =>
                    setPlan((p) => ({
                      ...p,
                      zone_high: n,
                      zone_low: Math.min(n, p.zone_low ?? n),
                    }))
                  }
                />
              </div>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold">{c.routineTitle}</h4>
              <p className="text-xs text-muted-foreground">{c.routineHint}</p>
              {routine.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={1440}
                    aria-label={c.minutesBefore}
                    value={r.at}
                    onChange={(e) =>
                      setPlan((p) => ({
                        ...p,
                        routine: routine.map((x, j) =>
                          j === i ? { ...x, at: Number(e.target.value) } : x,
                        ),
                      }))
                    }
                    className="w-20 shrink-0"
                  />
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {c.minutesBefore}
                  </span>
                  <Input
                    value={r.label}
                    maxLength={120}
                    onChange={(e) =>
                      setPlan((p) => ({
                        ...p,
                        routine: routine.map((x, j) =>
                          j === i ? { ...x, label: e.target.value } : x,
                        ),
                      }))
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={c.remove}
                    onClick={() =>
                      setPlan((p) => ({
                        ...p,
                        routine: routine.filter((_, j) => j !== i),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                disabled={routine.length >= 12}
                onClick={() =>
                  setPlan((p) => ({
                    ...p,
                    routine: [...routine, { at: 5, label: "" }],
                  }))
                }
              >
                <Plus className="h-4 w-4" />
                {c.addStep}
              </Button>
            </section>

            <section className="space-y-2">
              <h4 className="font-semibold">{c.ifThenTitle}</h4>
              <p className="text-xs text-muted-foreground">{c.ifThenHint}</p>
              {ifThen.map((x, i) => (
                <div
                  key={i}
                  className="grid gap-2 sm:grid-cols-[1fr_1fr_2.5rem]"
                >
                  <Input
                    placeholder={c.ifPh}
                    value={x.if}
                    maxLength={160}
                    onChange={(e) =>
                      setPlan((p) => ({
                        ...p,
                        if_then: ifThen.map((y, j) =>
                          j === i ? { ...y, if: e.target.value } : y,
                        ),
                      }))
                    }
                  />
                  <Input
                    placeholder={c.thenPh}
                    value={x.then}
                    maxLength={160}
                    onChange={(e) =>
                      setPlan((p) => ({
                        ...p,
                        if_then: ifThen.map((y, j) =>
                          j === i ? { ...y, then: e.target.value } : y,
                        ),
                      }))
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={c.remove}
                    onClick={() =>
                      setPlan((p) => ({
                        ...p,
                        if_then: ifThen.filter((_, j) => j !== i),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                disabled={ifThen.length >= 8}
                onClick={() =>
                  setPlan((p) => ({
                    ...p,
                    if_then: [...ifThen, { if: "", then: "" }],
                  }))
                }
              >
                <Plus className="h-4 w-4" />
                {c.addIfThen}
              </Button>
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="font-semibold">{c.cuesTitle}</span>
                <Input
                  value={cues}
                  maxLength={120}
                  placeholder={c.cuesPh}
                  onChange={(e) => setCues(e.target.value)}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-semibold">{c.focusTitle}</span>
                <Input
                  value={plan.focus ?? ""}
                  maxLength={200}
                  placeholder={c.focusPh}
                  onChange={(e) =>
                    setPlan((p) => ({ ...p, focus: e.target.value }))
                  }
                />
              </label>
            </div>
          </TabsContent>

          <TabsContent value="pre" className="space-y-5 pt-4">
            <div>
              <h4 className="font-semibold">{c.stateTitle}</h4>
              <p className="text-xs text-muted-foreground">{c.stateHint}</p>
            </div>
            {(
              ["cognitive", "somatic", "confidence", "activation"] as const
            ).map((k) => (
              <Scale
                key={k}
                id={`state-${k}`}
                label={c[k]}
                value={state[k] ?? 5}
                onChange={(n) => setState((s) => ({ ...s, [k]: n }))}
              />
            ))}
            <Scale
              id="state-direction"
              label={c.direction}
              min={-3}
              max={3}
              value={state.direction ?? 0}
              ends={c.directionEnds}
              onChange={(n) => setState((s) => ({ ...s, direction: n }))}
            />
            {(z || dir) && (
              <div className="space-y-2 rounded-xl border border-primary/40 bg-primary/5 p-4 text-sm">
                {z && <p>{c.zoneRead[z]}</p>}
                {dir && <p>{c.directionRead[dir]}</p>}
                {(plan.cues ?? []).length > 0 && (
                  <p className="font-semibold">
                    “{(plan.cues ?? []).join(" · ")}”
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="debrief" className="space-y-4 pt-4">
            <h4 className="font-semibold">{c.debriefTitle}</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="font-medium">{c.result}</span>
                <Input
                  value={result}
                  maxLength={200}
                  onChange={(e) => setResult(e.target.value)}
                />
              </label>
              <Scale
                id="debrief-rating"
                label={c.rating}
                value={rating}
                onChange={setRating}
              />
            </div>
            {Object.entries(c.debriefFields).map(([k, label]) => (
              <label key={k} className="block space-y-1 text-sm">
                <span className="font-medium">{label}</span>
                <Textarea
                  rows={2}
                  maxLength={1000}
                  value={String(debrief[k] ?? "")}
                  onChange={(e) =>
                    setDebrief((d) => ({ ...d, [k]: e.target.value }))
                  }
                />
              </label>
            ))}
            <Scale
              id="debrief-controllables"
              label={c.controllables}
              value={Number(debrief.controllables ?? 6)}
              onChange={(n) => setDebrief((d) => ({ ...d, controllables: n }))}
            />
          </TabsContent>
        </Tabs>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {c.cancel}
          </Button>
          <Button variant="primary" onClick={save} disabled={busy}>
            {busy ? c.saving : c.savePlan}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
