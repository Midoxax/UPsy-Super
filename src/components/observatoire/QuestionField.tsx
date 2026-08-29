import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Question, SurveyLang } from "@/lib/observatoire/instrument";

interface Props {
  question: Question;
  lang: SurveyLang;
  value: string | number | boolean | null | undefined;
  onChange: (value: string | number | boolean | null) => void;
  showError?: boolean;
}

const Scale = ({
  count,
  from,
  value,
  onChange,
}: {
  count: number;
  from: number;
  value: number | null;
  onChange: (v: number) => void;
}) => (
  <div
    className="grid gap-1.5"
    style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
    role="radiogroup"
  >
    {Array.from({ length: count }, (_, i) => i + from).map((v) => (
      <Button
        key={v}
        type="button"
        role="radio"
        aria-checked={value === v}
        variant={value === v ? "default" : "outline"}
        className="font-mono tabular-nums px-0"
        onClick={() => onChange(v)}
      >
        {v}
      </Button>
    ))}
  </div>
);

const QuestionField = ({ question: q, lang, value, onChange, showError }: Props) => {
  const invalid = showError && (value === null || value === undefined || value === "");

  return (
    <div
      className={cn(
        "space-y-3 rounded-u-card border p-4 transition-colors",
        invalid ? "border-destructive/60 bg-destructive/5" : "border-border/60 bg-muted/20"
      )}
    >
      <Label htmlFor={q.id} className="text-base leading-relaxed font-medium block">
        {q.label[lang]}
      </Label>
      {q.help && <p className="text-sm text-muted-foreground">{q.help[lang]}</p>}

      {q.kind === "likert" && (
        <>
          <Scale count={5} from={1} value={typeof value === "number" ? value : null} onChange={onChange} />
          {q.anchors && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{q.anchors[0][lang]}</span>
              <span>{q.anchors[1][lang]}</span>
            </div>
          )}
        </>
      )}

      {q.kind === "nps" && (
        <div className="overflow-x-auto -mx-1 px-1">
          <div className="min-w-[420px]">
            <Scale count={11} from={0} value={typeof value === "number" ? value : null} onChange={onChange} />
          </div>
        </div>
      )}

      {q.kind === "choice" && (
        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
          {q.options.map((opt) => (
            <Button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={value === opt.value}
              variant={value === opt.value ? "default" : "outline"}
              className="justify-start text-start h-auto py-2.5 whitespace-normal"
              onClick={() => onChange(opt.value)}
            >
              {opt.label[lang]}
            </Button>
          ))}
        </div>
      )}

      {q.kind === "boolean" && (
        <div className="flex gap-2" role="radiogroup">
          <Button
            type="button"
            role="radio"
            aria-checked={value === true}
            variant={value === true ? "default" : "outline"}
            onClick={() => onChange(true)}
          >
            {lang === "ar" ? "نعم" : "Oui"}
          </Button>
          <Button
            type="button"
            role="radio"
            aria-checked={value === false}
            variant={value === false ? "default" : "outline"}
            onClick={() => onChange(false)}
          >
            {lang === "ar" ? "لا" : "Non"}
          </Button>
        </div>
      )}

      {(q.kind === "price" || q.kind === "number") && (
        <div className="flex items-center gap-2 max-w-[240px]">
          <Input
            id={q.id}
            type="number"
            inputMode="numeric"
            min={q.min}
            max={q.max}
            className="font-mono tabular-nums"
            value={typeof value === "number" ? String(value) : ""}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") return onChange(null);
              const n = Number(raw);
              if (!Number.isFinite(n)) return;
              onChange(Math.max(q.min, Math.min(q.max, Math.round(n))));
            }}
          />
          {q.kind === "price" && (
            <span className="text-sm text-muted-foreground">{lang === "ar" ? "درهم" : "MAD"}</span>
          )}
        </div>
      )}

      {q.kind === "text" && (
        <Textarea
          id={q.id}
          rows={3}
          maxLength={q.maxLength ?? 1000}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
};

export default QuestionField;