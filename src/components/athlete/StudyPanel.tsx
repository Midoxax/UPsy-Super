import { useMemo, useState } from "react";
import { FlaskConical, ShieldCheck, LifeBuoy, ChevronLeft } from "lucide-react";
import { Link } from "@/lib/router-compat";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { useStudy, type Demographics } from "@/hooks/useStudy";
import { STUDY, useStudyCopy } from "@/lib/study/copy";
import {
  INSTRUMENTS,
  dueInstruments,
  instrument,
  nextPeriodStart,
  safetyFlag,
  studyLang,
  type InstrumentId,
} from "@/lib/study/instruments";

const MINUTES: Record<InstrumentId, number> = {
  sleep: 1,
  who5: 1,
  pss10: 2,
  abq: 3,
  mti: 2,
};

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

export default function StudyPanel() {
  const t = useStudyCopy();
  const { locale } = useLocale();
  const study = useStudy();
  const { enrollment, responses } = study;
  const [consentOpen, setConsentOpen] = useState(false);
  const [active, setActive] = useState<InstrumentId | null>(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [flag, setFlag] = useState<"urgent" | "notice" | null>(null);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(
      locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-FR" : "en-GB",
      { day: "numeric", month: "long" },
    );

  const due = useMemo(
    () =>
      enrollment && !enrollment.withdrawn_at
        ? dueInstruments(enrollment.consented_at, responses)
        : [],
    [enrollment, responses],
  );

  // The latest WHO-5 keeps its support message visible until the next one.
  const standingFlag = useMemo(() => {
    const w = responses.find((r) => r.instrument === "who5");
    return w ? safetyFlag("who5", w) : null;
  }, [responses]);
  const shownFlag = flag ?? standingFlag;

  if (study.loading) return <div className="glass-card p-6 h-40" />;

  const withdraw = async (deleteData: boolean) => {
    const { error } = await study.withdraw(deleteData);
    setWithdrawOpen(false);
    if (error) toast({ title: t.error, variant: "destructive" });
  };

  if (!enrollment || enrollment.withdrawn_at) {
    return (
      <div className="glass-card p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <FlaskConical className="w-7 h-7 text-primary shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground">{t.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t.pitch}</p>
          </div>
        </div>
        {enrollment?.withdrawn_at ? (
          <p className="text-sm text-muted-foreground">
            {t.withdrawn(fmt(enrollment.withdrawn_at))}
          </p>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-2 text-sm">
            {t.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {b}
              </li>
            ))}
          </ul>
        )}
        <Button
          variant="primary"
          className="w-full sm:w-auto"
          onClick={() => setConsentOpen(true)}
        >
          {enrollment ? t.rejoin : t.learnMore}
        </Button>
        <ConsentDialog
          open={consentOpen}
          onOpenChange={setConsentOpen}
          onEnroll={study.enroll}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {shownFlag && (
        <div
          role="status"
          className={`glass-card p-5 border-s-4 ${
            shownFlag === "urgent" ? "border-destructive" : "border-amber-500"
          }`}
        >
          <div className="flex gap-3">
            <LifeBuoy className="w-6 h-6 text-primary shrink-0" />
            <div className="space-y-2">
              <p className="text-sm text-foreground">
                {shownFlag === "urgent" ? t.urgent : t.notice}
              </p>
              <p className="text-xs text-muted-foreground">{t.emergency}</p>
              <Button asChild size="sm" variant="primary">
                <Link to={addLocalePrefix("/psychologists", locale)}>
                  {t.book}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-primary" />
            {t.title}
          </h3>
          <Badge variant="outline" className="font-mono" dir="ltr">
            {t.code}: {enrollment.participant_code}
          </Badge>
        </div>

        {due.length === 0 && (
          <p className="text-sm text-muted-foreground">{t.upToDate}</p>
        )}

        <ul className="divide-y divide-border/40">
          {INSTRUMENTS.map((ins) => {
            const isDue = due.includes(ins.id);
            return (
              <li
                key={ins.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {ins.title[studyLang(locale)]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isDue
                      ? `${t.due} · ${t.minutes(MINUTES[ins.id])}`
                      : t.next(
                          fmt(
                            nextPeriodStart(
                              enrollment.consented_at,
                              ins.everyDays,
                            ),
                          ),
                        )}
                  </p>
                </div>
                {isDue && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setActive(ins.id)}
                  >
                    {t.answer}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>

        <p className="text-xs text-muted-foreground">{t.readinessNote}</p>
        <button
          type="button"
          onClick={() => setWithdrawOpen(true)}
          className="text-xs text-muted-foreground underline hover:text-foreground min-h-10"
        >
          {t.withdraw}
        </button>
      </div>

      <QuestionnaireDialog
        id={active}
        onClose={() => setActive(null)}
        onSubmit={async (id, answers) => {
          const res = await study.submit(id, answers);
          if (res.error) {
            toast({ title: t.error, variant: "destructive" });
            return false;
          }
          toast({ title: t.saved });
          const f = res.scored && safetyFlag(id, res.scored);
          if (f) setFlag(f);
          return true;
        }}
      />

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.withdrawTitle}</DialogTitle>
            <DialogDescription>{t.withdrawDesc}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={() => withdraw(false)}>
              {t.withdrawKeep}
            </Button>
            <Button variant="destructive" onClick={() => withdraw(true)}>
              {t.withdrawDelete}
            </Button>
            <Button variant="ghost" onClick={() => setWithdrawOpen(false)}>
              {t.cancel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ConsentDialog({
  open,
  onOpenChange,
  onEnroll,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onEnroll: (d: Demographics) => Promise<{ error: unknown }>;
}) {
  const t = useStudyCopy();
  const [checks, setChecks] = useState([false, false, false]);
  const [birthYear, setBirthYear] = useState("");
  const [sex, setSex] = useState("");
  const [sport, setSport] = useState("");
  const [level, setLevel] = useState("");
  const [busy, setBusy] = useState(false);

  const year = Number(birthYear);
  const adultBy = new Date().getFullYear() - 18;
  const tooYoung = birthYear.length === 4 && year > adultBy;
  const ready =
    checks.every(Boolean) &&
    year >= 1920 &&
    year <= adultBy &&
    sex &&
    sport.trim() &&
    level;

  const submit = async () => {
    setBusy(true);
    const { error } = await onEnroll({
      birthYear: year,
      sex,
      sport: sport.trim(),
      level,
    });
    setBusy(false);
    if (error) toast({ title: t.error, variant: "destructive" });
    else {
      toast({ title: t.joined });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.consentTitle}</DialogTitle>
          <DialogDescription>{t.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          {t.consent.map(([h, body]) => (
            <div key={h}>
              <p className="font-medium text-foreground">{h}</p>
              <p className="text-muted-foreground">{body}</p>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            {t.ethics(STUDY.ETHICS_REF)}
          </p>
        </div>

        <fieldset className="grid sm:grid-cols-2 gap-3 pt-2">
          <legend className="font-medium text-foreground text-sm mb-2">
            {t.about}
          </legend>
          <div className="space-y-1">
            <Label htmlFor="study-year">{t.birthYear}</Label>
            <Input
              id="study-year"
              inputMode="numeric"
              maxLength={4}
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, ""))}
              aria-invalid={tooYoung}
              dir="ltr"
            />
            {tooYoung && (
              <p className="text-xs text-destructive">{t.under18}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="study-sex">{t.sex}</Label>
            <select
              id="study-sex"
              className={selectClass}
              value={sex}
              onChange={(e) => setSex(e.target.value)}
            >
              <option value="" />
              {Object.entries(t.sexes).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="study-sport">{t.sport}</Label>
            <Input
              id="study-sport"
              maxLength={80}
              value={sport}
              onChange={(e) => setSport(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="study-level">{t.level}</Label>
            <select
              id="study-level"
              className={selectClass}
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="" />
              {Object.entries(t.levels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        <div className="space-y-3 pt-2">
          {t.checks.map((label, i) => (
            <label key={label} className="flex items-start gap-3 text-sm">
              <Checkbox
                checked={checks[i]}
                onCheckedChange={(v) =>
                  setChecks((cs) => cs.map((c, j) => (j === i ? !!v : c)))
                }
                className="mt-0.5"
              />
              {label}
            </label>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="primary"
            disabled={!ready || busy}
            onClick={submit}
            className="w-full sm:w-auto"
          >
            {busy ? t.joining : t.join}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** One question per screen; choosing an answer moves on. */
function QuestionnaireDialog({
  id,
  onClose,
  onSubmit,
}: {
  id: InstrumentId | null;
  onClose: () => void;
  onSubmit: (id: InstrumentId, answers: number[]) => Promise<boolean>;
}) {
  return (
    <Dialog open={!!id} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {id && (
          <QuestionnaireBody
            key={id}
            id={id}
            onDone={async (a) => {
              if (await onSubmit(id, a)) onClose();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function QuestionnaireBody({
  id,
  onDone,
}: {
  id: InstrumentId;
  onDone: (answers: number[]) => Promise<void>;
}) {
  const t = useStudyCopy();
  const { locale } = useLocale();
  const ins = instrument(id);
  const lang = studyLang(locale);
  const [answers, setAnswers] = useState<(number | undefined)[]>(
    ins.kind === "sleep" ? [7, 7, 0] : [],
  );
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const finish = async (a: number[]) => {
    setBusy(true);
    await onDone(a);
    setBusy(false);
  };

  if (ins.kind === "sleep") {
    const [hours, quality, trouble] = answers as number[];
    const set = (i: number, v: number) =>
      setAnswers((a) => a.map((x, j) => (j === i ? v : x)));
    return (
      <>
        <DialogHeader>
          <DialogTitle>{ins.title[studyLang(locale)]}</DialogTitle>
          <DialogDescription>{ins.stem[lang]}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-2">
          <SliderField
            label={t.sleepHours}
            value={hours}
            min={0}
            max={14}
            step={0.5}
            unit={t.hoursUnit}
            onChange={(v) => set(0, v)}
          />
          <SliderField
            label={t.sleepQuality}
            value={quality}
            min={0}
            max={10}
            step={1}
            ends={t.sleepQualityEnds}
            onChange={(v) => set(1, v)}
          />
          <SliderField
            label={t.sleepTrouble}
            value={trouble}
            min={0}
            max={7}
            step={1}
            unit={t.nightsUnit}
            onChange={(v) => set(2, v)}
          />
        </div>
        <DialogFooter>
          <Button
            variant="primary"
            disabled={busy}
            onClick={() => finish(answers as number[])}
          >
            {t.submit}
          </Button>
        </DialogFooter>
      </>
    );
  }

  const n = ins.items.length;
  const choose = (value: number) => {
    const next = [...answers];
    next[step] = value;
    setAnswers(next);
    if (step < n - 1) setStep(step + 1);
  };
  const complete = answers.length === n && answers.every((a) => a != null);

  return (
    <>
      <DialogHeader>
        <DialogTitle>{ins.title[studyLang(locale)]}</DialogTitle>
        <DialogDescription>{ins.stem[lang]}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Progress value={((step + 1) / n) * 100} className="h-1.5" />
          <span className="text-xs text-muted-foreground shrink-0">
            {t.of(step + 1, n)}
          </span>
        </div>
        <p
          className="font-medium text-foreground min-h-[3rem]"
          aria-live="polite"
        >
          {ins.items[step][lang]}
        </p>
        <div className="grid gap-2" role="radiogroup">
          {ins.options.map((o, i) => {
            const value = ins.min + i;
            const selected = answers[step] === value;
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => choose(value)}
                className={`min-h-11 rounded-lg border px-4 text-sm text-start transition-colors ${
                  selected
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border hover:border-primary"
                }`}
              >
                {o[lang]}
              </button>
            );
          })}
        </div>
      </div>
      <DialogFooter className="flex-row justify-between gap-2">
        <Button
          variant="ghost"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          {t.back}
        </Button>
        {step === n - 1 && (
          <Button
            variant="primary"
            disabled={!complete || busy}
            onClick={() => finish(answers as number[])}
          >
            {t.submit}
          </Button>
        )}
      </DialogFooter>
    </>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  unit,
  ends,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  ends?: [string, string];
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-foreground">{label}</p>
        <span className="text-sm font-semibold tabular-nums shrink-0">
          {value}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        aria-label={label}
      />
      {ends && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{ends[0]}</span>
          <span>{ends[1]}</span>
        </div>
      )}
    </div>
  );
}
