import { useState } from "react";
import { Flag, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DAY, isoDay } from "@/lib/performance/metrics";
import { fmtDay, type PerfCopy } from "@/lib/performance/copy";
import type { SeasonPhase } from "@/hooks/usePerformance";
import type { Competition } from "@/hooks/useAthleteHub";

const KINDS = [
  "general_prep",
  "specific_prep",
  "pre_competition",
  "competition",
  "transition",
] as const;

/** Phase colours (inline: specific to this chart). */
const TONE: Record<string, string> = {
  general_prep: "#64748b",
  specific_prep: "#2E5B8C",
  pre_competition: "#b7791f",
  competition: "#6D0F22",
  transition: "#3f8f6b",
};

const t = (iso: string) => new Date(`${iso}T12:00:00`).getTime();

/**
 * Periodisation of mental skills alongside the physical plan: phases on a
 * timeline with the competitions and today, plus a form to add a phase.
 */
export default function SeasonPlanner({
  c,
  phases,
  competitions,
  onAdd,
  onRemove,
}: {
  c: PerfCopy;
  phases: SeasonPhase[];
  competitions: Competition[];
  onAdd: (p: Omit<SeasonPhase, "id">) => Promise<{ error: Error | null }>;
  onRemove: (id: string) => void;
}) {
  const today = isoDay(new Date());
  const [form, setForm] = useState({
    name: "",
    kind: "general_prep",
    starts_on: today,
    ends_on: isoDay(new Date(Date.now() + 27 * DAY)),
    focus: "",
  });
  const [busy, setBusy] = useState(false);

  // Window: from a month ago (or the first phase) to six months ahead (or
  // the last phase / competition), so today is always visible.
  const dates = [
    t(today) - 30 * DAY,
    t(today) + 180 * DAY,
    ...phases.flatMap((p) => [t(p.starts_on), t(p.ends_on)]),
    ...competitions.map((x) => t(x.event_date)),
  ];
  const from = Math.max(Math.min(...dates), t(today) - 365 * DAY);
  const to = Math.min(Math.max(...dates), t(today) + 540 * DAY);
  const span = to - from || 1;
  const share = (ms: number) =>
    Math.min(100, Math.max(0, ((ms - from) / span) * 100));
  const pct = (ms: number) => `${share(ms)}%`;
  const months: { label: string; at: number }[] = [];
  const m = new Date(from);
  m.setDate(1);
  m.setMonth(m.getMonth() + 1);
  while (m.getTime() < to) {
    months.push({
      label: m.toLocaleDateString(c.dateLocale, { month: "short" }),
      at: m.getTime(),
    });
    m.setMonth(m.getMonth() + 1);
  }
  const inWindow = competitions.filter(
    (x) => t(x.event_date) >= from && t(x.event_date) <= to,
  );

  const add = async () => {
    if (!form.name.trim() || form.ends_on < form.starts_on) return;
    setBusy(true);
    const { error } = await onAdd({
      ...form,
      name: form.name.trim(),
      focus: form.focus.trim() || c.phaseFocusHints[form.kind] || null,
    });
    setBusy(false);
    if (error) return toast.error(c.saveFailed, { description: error.message });
    toast.success(c.saved);
    setForm((f) => ({ ...f, name: "", focus: "" }));
  };

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted-foreground">{c.seasonIntro}</p>

      <section className="rounded-2xl border border-border bg-card p-5">
        {phases.length === 0 && inWindow.length === 0 ? (
          <p className="text-sm text-muted-foreground">{c.noPhases}</p>
        ) : (
          <div className="overflow-x-auto">
            <div
              className="relative space-y-2 pb-5"
              style={{ minWidth: 640 }}
              dir="ltr"
            >
              {/* Month ticks */}
              <div className="relative h-5 text-[11px] text-muted-foreground">
                {months.map((mo) => (
                  <span
                    key={mo.at}
                    className="absolute top-0 border-s border-border ps-1"
                    style={{ left: pct(mo.at) }}
                  >
                    {mo.label}
                  </span>
                ))}
              </div>
              {/* Phases */}
              {phases.map((p) => {
                const left = share(t(p.starts_on));
                const width = Math.max(1.5, share(t(p.ends_on) + DAY) - left);
                // A short phase keeps its name beside the bar, not cut inside.
                const narrow = width < 9;
                return (
                  <div key={p.id} className="relative h-10">
                    <div
                      className="absolute top-0 flex h-10 items-center overflow-hidden rounded-lg px-2 text-xs font-medium text-white"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        background: TONE[p.kind] ?? TONE.general_prep,
                      }}
                      title={`${p.name} · ${c.phaseKinds[p.kind]} · ${p.focus ?? ""}`}
                    >
                      {!narrow && <span className="truncate">{p.name}</span>}
                    </div>
                    {narrow && (
                      <span
                        className="absolute top-0 flex h-10 items-center whitespace-nowrap ps-2 text-xs font-medium"
                        style={{ left: `${left + width}%` }}
                      >
                        {p.name}
                      </span>
                    )}
                  </div>
                );
              })}
              {/* Competitions */}
              <div className="relative h-8">
                {inWindow.map((x) => (
                  <span
                    key={x.id}
                    className="absolute top-1 -translate-x-1/2"
                    style={{ left: pct(t(x.event_date)) }}
                    title={`${x.name} · ${fmtDay(c, x.event_date)}`}
                  >
                    <Flag className="h-5 w-5 text-primary" />
                  </span>
                ))}
              </div>
              {/* Today */}
              <div
                className="pointer-events-none absolute bottom-0 top-0 w-px bg-primary"
                style={{ left: pct(t(today)) }}
              >
                <span
                  className="absolute start-1 whitespace-nowrap text-[10px] font-semibold uppercase text-primary"
                  style={{ bottom: -16 }}
                >
                  {c.todayMarker}
                </span>
              </div>
            </div>
          </div>
        )}
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          {KINDS.map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: TONE[k] }}
              />
              {c.phaseKinds[k]}
            </span>
          ))}
        </div>
      </section>

      {phases.length > 0 && (
        <ul className="grid gap-3 md:grid-cols-2">
          {phases.map((p) => (
            <li
              key={p.id}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <span
                className="mt-1 h-3 w-3 shrink-0 rounded-sm"
                style={{ background: TONE[p.kind] }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.phaseKinds[p.kind]} · {fmtDay(c, p.starts_on)} →{" "}
                  {fmtDay(c, p.ends_on)}
                </p>
                {p.focus && <p className="mt-1 text-sm">{p.focus}</p>}
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label={c.remove}
                onClick={() => onRemove(p.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h3 className="font-semibold">{c.addPhase}</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-sm">
            <span>{c.phaseName}</span>
            <Input
              value={form.name}
              maxLength={120}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>{c.phaseKind}</span>
            <select
              value={form.kind}
              onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))}
              className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {c.phaseKinds[k]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span>{c.starts}</span>
            <Input
              type="date"
              value={form.starts_on}
              onChange={(e) =>
                setForm((f) => ({ ...f, starts_on: e.target.value }))
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>{c.ends}</span>
            <Input
              type="date"
              value={form.ends_on}
              min={form.starts_on}
              onChange={(e) =>
                setForm((f) => ({ ...f, ends_on: e.target.value }))
              }
            />
          </label>
        </div>
        <label className="block space-y-1 text-sm">
          <span>{c.phaseFocus}</span>
          <Input
            value={form.focus}
            maxLength={300}
            placeholder={c.phaseFocusHints[form.kind]}
            onChange={(e) => setForm((f) => ({ ...f, focus: e.target.value }))}
          />
        </label>
        <Button
          variant="primary"
          size="sm"
          onClick={add}
          disabled={busy || !form.name.trim() || form.ends_on < form.starts_on}
        >
          <Plus className="h-4 w-4" />
          {c.addPhase}
        </Button>
      </section>
    </div>
  );
}
