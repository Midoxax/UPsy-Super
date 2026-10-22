import { useState } from "react";
import { Target, Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import type { Goal } from "@/hooks/useAthleteHub";
import { useHubCopy, fmtDate } from "@/components/athlete/copy";

type Res = Promise<{ error: Error | null }>;

interface Props {
  goals: Goal[];
  onAdd: (g: { title: string; kind: string; target_date?: string }) => Res;
  onUpdate: (id: string, patch: Partial<Goal>) => Res;
}

const KINDS = ["process", "performance", "mental", "outcome"] as const;

export default function GoalsPanel({ goals, onAdd, onUpdate }: Props) {
  const c = useHubCopy();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<string>("process");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  // Slider moves locally; the value is saved when the thumb is released.
  const [draft, setDraft] = useState<Record<string, number>>({});

  const report = (r: { error: Error | null }) => {
    if (r.error)
      toast({
        title: c.saveFailed,
        description: r.error.message,
        variant: "destructive",
      });
  };

  const add = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const r = await onAdd({ title: title.trim(), kind, target_date: date });
    setSaving(false);
    report(r);
    if (!r.error) {
      setTitle("");
      setDate("");
    }
  };

  const active = goals.filter((g) => g.status === "active");
  const done = goals.filter((g) => g.status === "done");

  return (
    <div className="glass-card p-5 sm:p-6 space-y-5">
      <p className="text-sm text-muted-foreground">{c.goalsIntro}</p>

      <div className="space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={c.goalPlaceholder}
          aria-label={c.goalTitle}
          maxLength={200}
        />
        <div
          className="flex flex-wrap gap-2"
          role="radiogroup"
          aria-label={c.goalKind}
        >
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={kind === k}
              onClick={() => setKind(k)}
              className={`min-h-9 rounded-full border px-3 text-xs transition-colors ${kind === k ? "bg-primary text-primary-foreground border-primary" : "border-border/60 text-muted-foreground hover:text-foreground"}`}
            >
              {c.kinds[k]}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <label className="flex-1 text-xs text-muted-foreground">
            {c.targetDate}
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
            />
          </label>
          <Button
            variant="primary"
            onClick={add}
            disabled={!title.trim() || saving}
            className="w-full sm:w-auto"
          >
            <Target className="w-4 h-4" />
            {c.addGoal}
          </Button>
        </div>
      </div>

      {goals.length === 0 ? (
        <p className="text-sm text-muted-foreground border-t border-border/40 pt-4">
          {c.goalsEmpty}
        </p>
      ) : (
        <div className="space-y-4 border-t border-border/40 pt-4">
          {active.length > 0 && (
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {c.activeGoals} · {active.length}
            </p>
          )}
          {active.map((g) => {
            const value = draft[g.id] ?? g.progress;
            return (
              <div
                key={g.id}
                className="rounded-xl border border-border/40 p-3 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground break-words">
                      {g.title}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <Badge variant="outline" className="text-[10px]">
                        {c.kinds[g.kind] ?? g.kind}
                      </Badge>
                      {g.target_date && (
                        <Badge variant="outline" className="text-[10px]">
                          {fmtDate(c, g.target_date)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-sm tabular-nums font-semibold text-primary">
                    {value}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={10}
                  value={[value]}
                  aria-label={`${c.progress}: ${g.title}`}
                  onValueChange={(v) =>
                    setDraft((d) => ({ ...d, [g.id]: v[0] }))
                  }
                  onValueCommit={async (v) =>
                    report(await onUpdate(g.id, { progress: v[0] }))
                  }
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () =>
                      report(
                        await onUpdate(g.id, { status: "done", progress: 100 }),
                      )
                    }
                  >
                    <Check className="w-4 h-4" />
                    {c.markDone}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () =>
                      report(await onUpdate(g.id, { status: "dropped" }))
                    }
                  >
                    <X className="w-4 h-4" />
                    {c.drop}
                  </Button>
                </div>
              </div>
            );
          })}
          {done.length > 0 && (
            <>
              <p className="text-xs uppercase tracking-widest text-muted-foreground pt-2">
                {c.doneGoals} · {done.length}
              </p>
              {done.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-primary/5 px-3 py-2"
                >
                  <p className="text-sm text-foreground flex items-center gap-2 min-w-0">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span className="break-words">{g.title}</span>
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () =>
                      report(await onUpdate(g.id, { status: "active" }))
                    }
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="sr-only sm:not-sr-only">{c.reopen}</span>
                  </Button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
