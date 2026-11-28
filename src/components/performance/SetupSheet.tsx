import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AREA_PROTOCOLS,
  profileGaps,
  profileProgress,
  type Area,
  type Quality,
} from "@/lib/performance/metrics";
import { fmtDay, type PerfCopy } from "@/lib/performance/copy";
import type { ProfileSnapshot } from "@/hooks/usePerformance";
import type { Protocol } from "@/hooks/useAthleteHub";

const AREAS: Area[] = ["mental", "physical", "technical", "tactical"];
const clamp = (n: number) => Math.min(10, Math.max(1, Math.round(n) || 1));

/**
 * Performance profiling (Butler & Hardy, 1992): the athlete's own qualities,
 * current vs target, the largest gaps first, each linked to protocols.
 */
export default function SetupSheet({
  c,
  profiles,
  protocols,
  protocolTitle,
  onOpenProtocol,
  onSave,
}: {
  c: PerfCopy;
  profiles: ProfileSnapshot[];
  protocols: Protocol[];
  protocolTitle: (p: Protocol) => string;
  onOpenProtocol: (p: Protocol) => void;
  onSave: (q: Quality[]) => Promise<{ error: Error | null }>;
}) {
  const latest = profiles[0];
  const previous = profiles[1];
  const [rows, setRows] = useState<Quality[]>(latest?.qualities ?? []);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (latest) setRows(latest.qualities);
  }, [latest]);

  const valid = rows.filter((r) => r.label.trim());
  const used = new Set<string>();
  const gaps = useMemo(() => profileGaps(valid).slice(0, 3), [valid]);
  const progress = useMemo(
    () =>
      latest && previous
        ? profileProgress(latest.qualities, previous.qualities).filter(
            (p) => p.delta !== 0,
          )
        : [],
    [latest, previous],
  );
  // Phones: shorter labels and a smaller web, so no label is clipped.
  const narrow = typeof window !== "undefined" && window.innerWidth < 640;
  const max = narrow ? 11 : 18;
  const radar = valid.map((q) => ({
    label: q.label.length > max ? `${q.label.slice(0, max - 1)}…` : q.label,
    current: q.current,
    ideal: q.ideal,
  }));

  const set = (i: number, patch: Partial<Quality>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const add = (label = "", area: Area = "mental") =>
    rows.length < 20 &&
    setRows((rs) => [...rs, { label, area, current: 5, ideal: 8 }]);

  const save = async () => {
    if (!valid.length) return;
    setBusy(true);
    const { error } = await onSave(
      valid.map((q) => ({
        ...q,
        label: q.label.trim().slice(0, 60),
        current: clamp(q.current),
        ideal: clamp(q.ideal),
      })),
    );
    setBusy(false);
    if (error) toast.error(c.saveFailed, { description: error.message });
    else toast.success(c.snapshotSaved);
  };

  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-sm text-muted-foreground">{c.setupIntro}</p>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Editor */}
        <section className="min-w-0 space-y-3 rounded-2xl border border-border bg-card p-5">
          {rows.length === 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{c.starter}</p>
              <div className="flex flex-wrap gap-2">
                {c.starterSet.map(([label, area]) => (
                  <Button
                    key={label}
                    size="sm"
                    variant="outline"
                    onClick={() => add(label, area as Area)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {rows.length > 0 && (
            <div className="hidden gap-2 text-[11px] uppercase tracking-widest text-muted-foreground sm:flex">
              <span className="flex-1">{c.quality}</span>
              <span className="w-28">{c.area}</span>
              <span className="w-16">{c.current}</span>
              <span className="w-16">{c.ideal}</span>
              <span className="w-10" />
            </div>
          )}
          {rows.map((r, i) => (
            <div key={i} className="flex flex-col gap-2 sm:flex-row">
              <Input
                aria-label={c.quality}
                value={r.label}
                maxLength={60}
                onChange={(e) => set(i, { label: e.target.value })}
                className="flex-1"
              />
              <div className="flex gap-2">
                <select
                  aria-label={c.area}
                  value={r.area}
                  onChange={(e) => set(i, { area: e.target.value as Area })}
                  className="h-10 flex-1 rounded-md border border-input bg-background px-2 text-sm sm:w-28 sm:flex-none"
                >
                  {AREAS.map((a) => (
                    <option key={a} value={a}>
                      {c.areas[a]}
                    </option>
                  ))}
                </select>
                <Input
                  aria-label={c.current}
                  type="number"
                  min={1}
                  max={10}
                  value={r.current}
                  onChange={(e) => set(i, { current: Number(e.target.value) })}
                  className="w-16"
                />
                <Input
                  aria-label={c.ideal}
                  type="number"
                  min={1}
                  max={10}
                  value={r.ideal}
                  onChange={(e) => set(i, { ideal: Number(e.target.value) })}
                  className="w-16"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={c.remove}
                  onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => add()}>
              <Plus className="h-4 w-4" />
              {c.addQuality}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={save}
              disabled={busy || !valid.length}
            >
              {busy ? c.saving : c.saveSnapshot}
            </Button>
          </div>
          {latest && (
            <p className="text-xs text-muted-foreground">
              {c.history(profiles.length, fmtDay(c, latest.created_at))}
            </p>
          )}
        </section>

        {/* Radar */}
        <section className="min-w-0 rounded-2xl border border-border bg-card p-5">
          {radar.length >= 3 ? (
            <div style={{ height: 320 }} dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar} outerRadius={narrow ? "52%" : "72%"}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 10]}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    name={c.ideal}
                    dataKey="ideal"
                    stroke="hsl(var(--secondary))"
                    fill="hsl(var(--secondary))"
                    fillOpacity={0.12}
                  />
                  <Radar
                    name={c.current}
                    dataKey="current"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.35}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{c.setupIntro}</p>
          )}
        </section>
      </div>

      {gaps.length > 0 && gaps[0].gap > 0 && (
        <section className="space-y-3">
          <h3 className="font-semibold">{c.priorities}</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {gaps
              .filter((g) => g.gap > 0)
              .map((g, i) => {
                const cats = AREA_PROTOCOLS[g.area];
                // Different protocols for each priority where possible.
                const fit = protocols.filter((p) => cats.includes(p.category));
                const suggested = [
                  ...fit.filter((p) => !used.has(p.id)),
                  ...fit.filter((p) => used.has(p.id)),
                ].slice(0, 2);
                suggested.forEach((p) => used.add(p.id));
                return (
                  <div
                    key={g.label}
                    className="space-y-3 rounded-2xl border border-border bg-card p-5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                          P{i + 1} · {c.areas[g.area]}
                        </p>
                        <p className="font-semibold">{g.label}</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {c.gap(g.gap)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(g.current / 10) * 100}%` }}
                      />
                    </div>
                    {suggested.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {c.trainWith}
                        </p>
                        {suggested.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => onOpenProtocol(p)}
                            className="block text-start text-sm font-medium text-primary hover:underline"
                          >
                            {protocolTitle(p)} · {p.duration_minutes} min
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {progress.length > 0 && (
        <section className="space-y-2">
          <h3 className="font-semibold">{c.sinceLast}</h3>
          <ul className="flex flex-wrap gap-2">
            {progress.map((p) => (
              <li
                key={p.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm"
              >
                {p.delta > 0 ? (
                  <TrendingUp className="h-4 w-4 text-primary" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                )}
                {p.label}
                <span className="font-semibold tabular-nums" dir="ltr">
                  {p.delta > 0 ? `+${p.delta}` : p.delta}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
