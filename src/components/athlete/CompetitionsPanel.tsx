import { useState } from "react";
import {
  Trophy,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import type { ChecklistItem, Competition } from "@/hooks/useAthleteHub";
import { useHubCopy, fmtDate } from "@/components/athlete/copy";

type Res = Promise<{ error: Error | null }>;

interface Props {
  competitions: Competition[];
  onAdd: (c: {
    name: string;
    event_date: string;
    location?: string;
    importance: number;
    checklist: ChecklistItem[];
  }) => Res;
  onUpdate: (id: string, patch: Partial<Competition>) => Res;
  onRemove: (id: string) => Res;
}

// Local date as YYYY-MM-DD (en-CA formats that way), to compare with event_date.
const todayISO = () => new Date().toLocaleDateString("en-CA");
const daysBetween = (iso: string) =>
  Math.round(
    (new Date(iso + "T00:00:00").getTime() -
      new Date(todayISO() + "T00:00:00").getTime()) /
      86400000,
  );

export default function CompetitionsPanel({
  competitions,
  onAdd,
  onUpdate,
  onRemove,
}: Props) {
  const c = useHubCopy();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [importance, setImportance] = useState(2);
  const [saving, setSaving] = useState(false);

  const report = (r: { error: Error | null }) => {
    if (r.error)
      toast({
        title: c.saveFailed,
        description: r.error.message,
        variant: "destructive",
      });
  };

  const add = async () => {
    if (!name.trim() || !date) return;
    setSaving(true);
    const r = await onAdd({
      name: name.trim(),
      event_date: date,
      location: location.trim(),
      importance,
      checklist: c.routineDefault.map((label) => ({ label, done: false })),
    });
    setSaving(false);
    report(r);
    if (!r.error) {
      setName("");
      setDate("");
      setLocation("");
    }
  };

  const today = todayISO();
  const upcoming = competitions.filter((x) => x.event_date >= today);
  const past = competitions.filter((x) => x.event_date < today).reverse();

  return (
    <div className="glass-card p-5 sm:p-6 space-y-5">
      <p className="text-sm text-muted-foreground">{c.compIntro}</p>

      <div className="space-y-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={c.compNamePlaceholder}
          aria-label={c.compName}
          maxLength={200}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-xs text-muted-foreground">
            {c.compDate}
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
            />
          </label>
          <label className="text-xs text-muted-foreground">
            {c.compLocation}
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={200}
              className="mt-1"
            />
          </label>
        </div>
        <div
          className="flex flex-wrap items-center gap-2"
          role="radiogroup"
          aria-label={c.importance}
        >
          <span className="text-xs text-muted-foreground">{c.importance}</span>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={importance === n}
              onClick={() => setImportance(n)}
              className={`min-h-9 rounded-full border px-3 text-xs ${importance === n ? "bg-primary text-primary-foreground border-primary" : "border-border/60 text-muted-foreground"}`}
            >
              {c.importanceLevels[n]}
            </button>
          ))}
        </div>
        <Button
          variant="primary"
          onClick={add}
          disabled={!name.trim() || !date || saving}
          className="w-full sm:w-auto"
        >
          <Trophy className="w-4 h-4" />
          {c.newComp}
        </Button>
      </div>

      {competitions.length === 0 ? (
        <p className="text-sm text-muted-foreground border-t border-border/40 pt-4">
          {c.compsEmpty}
        </p>
      ) : (
        <div className="space-y-4 border-t border-border/40 pt-4">
          {upcoming.length > 0 && (
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {c.upcoming}
            </p>
          )}
          {upcoming.map((x) => (
            <UpcomingCard
              key={x.id}
              comp={x}
              onUpdate={onUpdate}
              onRemove={onRemove}
              report={report}
            />
          ))}
          {past.length > 0 && (
            <p className="text-xs uppercase tracking-widest text-muted-foreground pt-2">
              {c.past}
            </p>
          )}
          {past.slice(0, 6).map((x) => (
            <DebriefCard
              key={x.id}
              comp={x}
              onUpdate={onUpdate}
              report={report}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Header({ comp }: { comp: Competition }) {
  const c = useHubCopy();
  const d = daysBetween(comp.event_date);
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-medium text-foreground break-words">{comp.name}</p>
        <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2">
          <span>
            {fmtDate(c, comp.event_date, {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </span>
          {comp.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {comp.location}
            </span>
          )}
        </p>
      </div>
      <Badge
        variant={d >= 0 && d <= 7 ? "default" : "outline"}
        className="shrink-0 text-[11px]"
      >
        {d >= 0 ? c.inDays(d) : c.daysAgo(-d)}
      </Badge>
    </div>
  );
}

function UpcomingCard({
  comp,
  onUpdate,
  onRemove,
  report,
}: {
  comp: Competition;
  onUpdate: Props["onUpdate"];
  onRemove: Props["onRemove"];
  report: (r: { error: Error | null }) => void;
}) {
  const c = useHubCopy();
  const [step, setStep] = useState("");
  const list = comp.checklist ?? [];
  const save = async (checklist: ChecklistItem[]) =>
    report(await onUpdate(comp.id, { checklist }));
  const doneCount = list.filter((i) => i.done).length;

  return (
    <div className="rounded-xl border border-border/40 p-3 space-y-3">
      <Header comp={comp} />
      <div>
        <p className="text-xs font-medium text-foreground mb-2">
          {c.routine} · {doneCount}/{list.length}
        </p>
        <ul className="space-y-1">
          {list.map((item, i) => (
            <li key={i}>
              <button
                type="button"
                aria-pressed={item.done}
                onClick={() =>
                  save(
                    list.map((x, j) => (j === i ? { ...x, done: !x.done } : x)),
                  )
                }
                className="w-full min-h-10 flex items-center gap-2 rounded-lg px-2 text-left text-sm hover:bg-muted/40"
              >
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                <span
                  className={
                    item.done
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }
                >
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <form
          className="flex gap-2 mt-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!step.trim()) return;
            save([...list, { label: step.trim().slice(0, 120), done: false }]);
            setStep("");
          }}
        >
          <Input
            value={step}
            onChange={(e) => setStep(e.target.value)}
            placeholder={c.addStep}
            aria-label={c.addStep}
          />
          <Button
            type="submit"
            size="icon"
            variant="outline"
            aria-label={c.addStep}
            disabled={!step.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </form>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={async () => report(await onRemove(comp.id))}
      >
        <Trash2 className="w-4 h-4" />
        {c.remove}
      </Button>
    </div>
  );
}

function DebriefCard({
  comp,
  onUpdate,
  report,
}: {
  comp: Competition;
  onUpdate: Props["onUpdate"];
  report: (r: { error: Error | null }) => void;
}) {
  const c = useHubCopy();
  const [result, setResult] = useState(comp.result ?? "");
  const [rating, setRating] = useState<number | null>(comp.performance_rating);
  const [reflection, setReflection] = useState(comp.reflection ?? "");
  const [open, setOpen] = useState(
    !comp.reflection && !comp.performance_rating,
  );
  const [saving, setSaving] = useState(false);

  return (
    <div className="rounded-xl border border-border/40 p-3 space-y-3">
      <Header comp={comp} />
      {!open ? (
        <div className="text-sm space-y-1">
          {comp.result && <p className="text-foreground">{comp.result}</p>}
          {comp.performance_rating && (
            <p className="text-muted-foreground">
              {c.rating}:{" "}
              <span className="font-semibold text-foreground">
                {comp.performance_rating}
              </span>
            </p>
          )}
          {comp.reflection && (
            <p className="text-muted-foreground whitespace-pre-wrap">
              {comp.reflection}
            </p>
          )}
          <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
            {c.debrief}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Input
            value={result}
            onChange={(e) => setResult(e.target.value)}
            placeholder={c.result}
            aria-label={c.result}
            maxLength={200}
          />
          <div>
            <p className="text-xs text-muted-foreground mb-2">{c.rating}</p>
            <div
              className="grid grid-cols-5 sm:grid-cols-10 gap-1.5"
              role="radiogroup"
              aria-label={c.rating}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  onClick={() => setRating(n)}
                  className={`h-10 rounded-lg border text-sm ${rating === n ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <Textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder={c.reflectionLabel}
            aria-label={c.reflectionLabel}
            rows={3}
            maxLength={4000}
          />
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              const r = await onUpdate(comp.id, {
                result: result.trim() || null,
                performance_rating: rating,
                reflection: reflection.trim() || null,
              });
              setSaving(false);
              report(r);
              if (!r.error) setOpen(false);
            }}
          >
            {saving ? c.saving : c.saveDebrief}
          </Button>
        </div>
      )}
    </div>
  );
}
