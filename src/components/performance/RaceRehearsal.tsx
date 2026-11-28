import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Pause, Play, SkipForward, Volume2, VolumeX, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";
import { isoDay, sortedRoutine } from "@/lib/performance/metrics";
import { fmtDay, type PerfCopy } from "@/lib/performance/copy";
import type { Competition } from "@/hooks/useAthleteHub";
import type { Session } from "@/hooks/usePerformance";

/** Seconds per routine step; the opening and closing steps are shorter. */
const STEP_SECONDS = 40;
const EDGE_SECONDS = 20;
/** Resonance-style pacing: 4 s in, 6 s out. */
const IN = 4;
const OUT = 6;

const VOICE: Record<string, string> = { fr: "fr-FR", en: "en-GB", ar: "ar-SA" };

/**
 * Imagery rehearsal of the athlete's own race routine (PETTLEP): the steps
 * in order with a breathing pacer and cue words, optional voice guidance,
 * logged as a mental-training session when finished.
 */
export default function RaceRehearsal({
  c,
  competitions,
  onLog,
}: {
  c: PerfCopy;
  competitions: Competition[];
  onLog: (s: Omit<Session, "id" | "load">) => Promise<{ error: Error | null }>;
}) {
  const { locale } = useLocale();
  const today = isoDay(new Date());
  const planned = competitions.filter(
    (x) => x.event_date >= today && (x.race_plan?.routine?.length ?? 0) > 0,
  );
  const [race, setRace] = useState<Competition | null>(null);

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <h3 className="font-semibold">{c.rehearseTitle}</h3>
      <p className="max-w-3xl text-sm text-muted-foreground">
        {c.rehearseIntro}
      </p>
      {planned.length === 0 ? (
        <p className="text-sm">{c.rehearseNone}</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {planned.map((x) => (
            <li key={x.id}>
              <Button variant="outline" onClick={() => setRace(x)}>
                <Play className="h-4 w-4" />
                {c.rehearseChoose}: {x.name} · {fmtDay(c, x.event_date)}
              </Button>
            </li>
          ))}
        </ul>
      )}
      {race && (
        <Rehearsal
          c={c}
          locale={locale}
          race={race}
          onClose={() => setRace(null)}
          onLog={onLog}
        />
      )}
    </section>
  );
}

function Rehearsal({
  c,
  locale,
  race,
  onClose,
  onLog,
}: {
  c: PerfCopy;
  locale: string;
  race: Competition;
  onClose: () => void;
  onLog: (s: Omit<Session, "id" | "load">) => Promise<{ error: Error | null }>;
}) {
  const plan = race.race_plan ?? {};
  const steps = [
    {
      label: c.rehearseIntroStep,
      at: null as number | null,
      secs: EDGE_SECONDS,
    },
    ...sortedRoutine(plan).map((r) => ({
      label: r.label,
      at: r.at,
      secs: STEP_SECONDS,
    })),
    { label: c.rehearseOutroStep, at: 0, secs: EDGE_SECONDS },
  ];
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(steps[0].secs);
  const [running, setRunning] = useState(false);
  const [voice, setVoice] = useState(
    typeof window !== "undefined" && "speechSynthesis" in window,
  );
  const [t, setT] = useState(0); // seconds since start, for the pacer
  const started = useRef<number | null>(null);
  const elapsed = useRef(0);

  const say = (text: string) => {
    if (!voice || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = VOICE[locale] ?? "fr-FR";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  // Speak each step as it starts.
  useEffect(() => {
    if (running) say(steps[i].label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, running]);

  // One tick a second while running.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      elapsed.current += 1;
      setT((x) => x + 1);
      setLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // When a step runs out, move to the next one, or stop after the last.
  useEffect(() => {
    if (!running || left > 0) return;
    if (i + 1 < steps.length) {
      setI(i + 1);
      setLeft(steps[i + 1].secs);
    } else setRunning(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, running]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const done = i === steps.length - 1 && left === 0;
  const phase = t % (IN + OUT) < IN ? "in" : "out";
  const scale = phase === "in" ? 1 : 0.62;

  const finish = async () => {
    window.speechSynthesis?.cancel();
    const minutes = Math.max(1, Math.round(elapsed.current / 60));
    const { error } = await onLog({
      session_date: isoDay(new Date()),
      kind: "mental",
      duration_minutes: minutes,
      rpe: 2,
      note: `${c.rehearseTitle}: ${race.name}`.slice(0, 500),
    });
    if (error) toast.error(c.saveFailed, { description: error.message });
    else toast.success(c.rehearseDone);
    onClose();
  };

  const step = steps[i];
  // A portal: the page transition's transform would otherwise pin this
  // "fixed" overlay inside the page instead of the screen.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={c.rehearseTitle}
      className="fixed inset-0 z-50 flex flex-col bg-[#0b0c10] text-white"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 40%, rgba(255,179,0,0.12), transparent 55%)",
      }}
    >
      <div className="container-custom flex items-center justify-between py-4">
        <p className="text-sm text-white/60">
          {race.name} · {c.rehearseStep(i + 1, steps.length)}
        </p>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/10 hover:text-white"
            aria-label={c.rehearseVoice}
            onClick={() => {
              setVoice((v) => !v);
              window.speechSynthesis?.cancel();
            }}
          >
            {voice ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/10 hover:text-white"
            aria-label={c.cancel}
            onClick={() => {
              window.speechSynthesis?.cancel();
              onClose();
            }}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="container-custom flex flex-1 flex-col items-center justify-center gap-8 text-center">
        {/* Breathing pacer */}
        <div className="relative flex h-56 w-56 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full bg-primary/20"
            style={{
              transform: `scale(${running ? scale : 0.8})`,
              transition: `transform ${phase === "in" ? IN : OUT}s ease-in-out`,
            }}
          />
          <div className="absolute inset-6 rounded-full border border-primary/40" />
          <span className="relative text-sm uppercase tracking-widest text-primary">
            {running ? (phase === "in" ? c.breatheIn : c.breatheOut) : "4 · 6"}
          </span>
        </div>

        <div className="max-w-2xl space-y-3">
          {step.at != null && step.at > 0 && (
            <p
              className="text-sm uppercase tracking-widest text-white/50"
              dir="ltr"
            >
              T-{step.at} min
            </p>
          )}
          <p className="font-display text-3xl leading-tight md:text-4xl">
            {step.label}
          </p>
          {(plan.cues ?? []).length > 0 && (
            <p className="text-lg font-semibold text-primary">
              “{(plan.cues ?? []).join(" · ")}”
            </p>
          )}
        </div>

        <div className="h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((step.secs - left) / step.secs) * 100}%` }}
          />
        </div>
      </div>

      <div className="container-custom flex flex-wrap justify-center gap-3 pb-10">
        {!done && (
          <Button
            size="lg"
            variant="primary"
            onClick={() => {
              started.current ??= Date.now();
              setRunning((r) => !r);
            }}
          >
            {running ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {running
              ? c.rehearsePause
              : started.current
                ? c.rehearseResume
                : c.rehearseStart}
          </Button>
        )}
        {!done && i < steps.length - 1 && (
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            onClick={() => {
              setI(i + 1);
              setLeft(steps[i + 1].secs);
            }}
          >
            <SkipForward className="h-4 w-4" />
            {c.rehearseNext}
          </Button>
        )}
        {(done || i === steps.length - 1) && (
          <Button size="lg" variant="primary" onClick={finish}>
            {c.rehearseFinish}
          </Button>
        )}
      </div>
    </div>,
    document.body,
  );
}
