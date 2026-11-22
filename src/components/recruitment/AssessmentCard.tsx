import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ClipboardCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLeagueMembership } from "@/hooks/useLeagueMembership";
import { INSTRUMENTS_BY_CODE } from "@/lib/psychometrics/instruments";
import { optionsFor, tr } from "@/lib/psychometrics/score";
import {
  ATTENTION,
  IPIP,
  IPIP_SCALE,
  NICHES,
  buildReport,
  type Likert,
  type Niche,
} from "@/lib/recruitment/battery";
import { useBatteryCopy } from "@/lib/recruitment/batteryCopy";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import TraitBars from "./TraitBars";

type Vignette = {
  id: string;
  niche: string;
  prompt_fr: string;
  prompt_en: string;
  options: { id: string; fr: string; en: string }[];
};

const store = {
  get: (k: string) => {
    try {
      return JSON.parse(localStorage.getItem(k) ?? "null");
    } catch {
      return null;
    }
  },
  set: (k: string, v: unknown) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
      /* private mode: progress is kept in memory only */
    }
  },
};

/** Candidates (applicants and League members) take the recruitment assessment. */
export default function AssessmentCard() {
  const { user } = useAuth();
  const { t } = useBatteryCopy();
  const { data: membership } = useLeagueMembership();
  const qc = useQueryClient();
  const key = ["recruitment-assessment", user?.id];
  const { data, isLoading } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async () => {
      const [a, app] = await Promise.all([
        supabase
          .from("recruitment_assessments")
          .select("*")
          .eq("user_id", user!.id)
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("psychologist_applications")
          .select("id")
          .eq("user_id", user!.id)
          .limit(1),
      ]);
      return {
        assessment: a.data,
        candidate: (app.data ?? []).length > 0,
      };
    },
  });
  const eligible =
    data?.candidate || !!membership?.active || !!membership?.pending;
  if (!user || isLoading || !data || !eligible) return null;
  const a = data.assessment;
  const refresh = () => qc.invalidateQueries({ queryKey: key });

  return (
    <Card className="p-5 space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <ClipboardCheck className="h-5 w-5 text-primary" /> {t.title}
      </h3>
      {a?.completed_at ? (
        <Results likert={a.likert as Likert} a={a} />
      ) : a ? (
        <Wizard id={a.id} onDone={refresh} />
      ) : (
        <Start onStarted={refresh} />
      )}
    </Card>
  );
}

function Start({ onStarted }: { onStarted: () => void }) {
  const { t } = useBatteryCopy();
  const [consent, setConsent] = useState(false);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [busy, setBusy] = useState(false);
  const toggle = (n: Niche) =>
    setNiches((cur) =>
      cur.includes(n)
        ? cur.filter((x) => x !== n)
        : cur.length < 2
          ? [...cur, n]
          : cur,
    );
  const start = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("recruitment_assessment_start", {
      _niches: niches,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    onStarted();
  };
  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted-foreground">{t.intro}</p>
      <p className="text-xs font-medium">{t.chooseNiches}</p>
      <div className="flex flex-wrap gap-2">
        {NICHES.map((n) => (
          <Button
            key={n}
            size="sm"
            type="button"
            variant={niches.includes(n) ? "default" : "outline"}
            onClick={() => toggle(n)}
          >
            {t.niches[n]}
          </Button>
        ))}
      </div>
      <label className="flex items-start gap-2 rounded-lg border p-3 text-xs">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        {t.consent}
      </label>
      <p className="text-xs text-muted-foreground">{t.oncePerYear}</p>
      <Button
        disabled={!consent || niches.length === 0 || busy}
        onClick={start}
      >
        {t.start}
      </Button>
    </div>
  );
}

function Scale({
  value,
  labels,
  onChange,
  name,
}: {
  value: number | undefined;
  labels: { value: number; label: string }[];
  onChange: (v: number) => void;
  name: string;
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-5" role="radiogroup">
      {labels.map((o) => (
        <label
          key={o.value}
          className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs cursor-pointer ${value === o.value ? "border-primary bg-primary/10" : ""}`}
        >
          <input
            type="radio"
            name={name}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}

function Wizard({ id, onDone }: { id: string; onDone: () => void }) {
  const { t, lang } = useBatteryCopy();
  const storeKey = `lsspm-battery-${id}`;
  const [step, setStep] = useState(0);
  const [likert, setLikert] = useState<Likert>(
    () => store.get(storeKey)?.likert ?? {},
  );
  const [sjt, setSjt] = useState<Record<string, string>>(
    () => store.get(storeKey)?.sjt ?? {},
  );
  const [busy, setBusy] = useState(false);
  useEffect(
    () => store.set(storeKey, { likert, sjt }),
    [storeKey, likert, sjt],
  );
  const { data: vignettes = [] } = useQuery({
    queryKey: ["recruitment-sjt", id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("recruitment_sjt_get", {
        _assessment: id,
      });
      if (error) throw error;
      return (data ?? []) as Vignette[];
    },
  });

  // Personality items with the attention checks slotted in.
  const part1 = useMemo(() => {
    const rows: { id: string; text: string }[] = [];
    IPIP.forEach((item, i) => {
      rows.push({ id: item.id, text: item.text });
      for (const a of ATTENTION)
        if (a.after === i + 1) rows.push({ id: a.id, text: a[lang] });
    });
    return rows;
  }, [lang]);
  const who5 = INSTRUMENTS_BY_CODE.who5;
  const k6 = INSTRUMENTS_BY_CODE.k6;
  const ipipLabels = IPIP_SCALE.map((label, i) => ({ value: i + 1, label }));
  const set = (k: string, v: number) => setLikert({ ...likert, [k]: v });

  const done1 = part1.every((r) => likert[r.id] != null);
  const done2 = [...who5.items, ...k6.items].every((i) => likert[i.id] != null);
  const done3 = vignettes.length > 0 && vignettes.every((v) => sjt[v.id]);

  const submit = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("recruitment_assessment_submit", {
      _assessment: id,
      _likert: likert,
      _sjt: sjt,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t.done);
    onDone();
  };

  return (
    <div className="space-y-4 text-sm">
      <p className="font-medium">{t.parts[step]}</p>
      {step === 0 && (
        <>
          <p className="text-xs text-muted-foreground">{t.ipipInstr}</p>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {t.ipipNote}
          </p>
          {part1.map((r, i) => (
            <div key={r.id} className="space-y-1">
              <p lang={r.id.startsWith("ipip") ? "en" : undefined}>
                {i + 1}. {r.text}
              </p>
              <Scale
                name={r.id}
                value={likert[r.id]}
                labels={ipipLabels}
                onChange={(v) => set(r.id, v)}
              />
            </div>
          ))}
        </>
      )}
      {step === 1 &&
        [who5, k6].map((inst) => (
          <div key={inst.code} className="space-y-2">
            <p className="text-xs font-medium">{tr(inst.name, lang)}</p>
            <p className="text-xs text-muted-foreground">
              {tr(inst.instructions, lang)}
            </p>
            {inst.items.map((item, i) => (
              <div key={item.id} className="space-y-1">
                <p>
                  {i + 1}. {tr(item.text, lang)}
                </p>
                <Scale
                  name={item.id}
                  value={likert[item.id]}
                  labels={optionsFor(inst, item).map((o) => ({
                    value: o.value,
                    label: tr(o.label, lang),
                  }))}
                  onChange={(v) => set(item.id, v)}
                />
              </div>
            ))}
          </div>
        ))}
      {step === 2 && (
        <>
          <p className="text-xs text-muted-foreground">{t.sjtInstr}</p>
          {vignettes.length === 0 && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          {vignettes.map((v, i) => (
            <fieldset key={v.id} className="space-y-1 rounded-lg border p-3">
              <legend className="px-1 text-xs text-muted-foreground">
                {v.niche === "core"
                  ? t.module.core
                  : t.niches[v.niche as Niche]}
              </legend>
              <p className="font-medium">
                {i + 1}. {lang === "en" ? v.prompt_en : v.prompt_fr}
              </p>
              {v.options.map((o) => (
                <label
                  key={o.id}
                  className={`flex items-start gap-2 rounded-md border p-2 text-xs cursor-pointer ${sjt[v.id] === o.id ? "border-primary bg-primary/10" : ""}`}
                >
                  <input
                    type="radio"
                    className="mt-0.5"
                    name={v.id}
                    checked={sjt[v.id] === o.id}
                    onChange={() => setSjt({ ...sjt, [v.id]: o.id })}
                  />
                  {lang === "en" ? o.en : o.fr}
                </label>
              ))}
            </fieldset>
          ))}
        </>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            {t.back}
          </Button>
        )}
        {step < 2 ? (
          <Button
            disabled={step === 0 ? !done1 : !done2}
            onClick={() => {
              setStep(step + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            {t.next}
          </Button>
        ) : (
          <Button disabled={!done3 || busy} onClick={submit}>
            {busy && <Loader2 className="h-4 w-4 me-1 animate-spin" />}
            {t.submit}
          </Button>
        )}
        {((step === 0 && !done1) ||
          (step === 1 && !done2) ||
          (step === 2 && !done3)) && (
          <span className="text-xs text-muted-foreground">{t.answerAll}</span>
        )}
      </div>
    </div>
  );
}

function Results({
  likert,
  a,
}: {
  likert: Likert;
  a: { started_at: string; completed_at: string | null };
}) {
  const { t, lang } = useBatteryCopy();
  const r = buildReport(likert, a.started_at, a.completed_at);
  return (
    <div className="space-y-3 text-sm">
      <p className="text-xs text-muted-foreground">{t.done}</p>
      <p className="font-medium">{t.results}</p>
      <TraitBars traits={r.traits} />
      <div className="grid gap-2 sm:grid-cols-2">
        {[
          [t.wellbeing, r.who5],
          [t.distress, r.k6],
        ].map(([label, res]) => {
          const x = res as typeof r.who5;
          const scale = x.total;
          return (
            <div key={label as string} className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">{label as string}</p>
              <p className="font-medium">
                {scale?.score}
                {scale?.band && ` — ${tr(scale.band.label, lang)}`}
              </p>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">{t.support}</p>
      <p className="text-xs text-muted-foreground">{t.sjtHidden}</p>
    </div>
  );
}
