import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { tr } from "@/lib/psychometrics/score";
import {
  buildReport,
  suggestedDivisions,
  type Likert,
  type Niche,
} from "@/lib/recruitment/battery";
import { useBatteryCopy } from "@/lib/recruitment/batteryCopy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TraitBars from "./TraitBars";

type Row = {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  niches: string[];
  started_at: string;
  completed_at: string | null;
  likert: Likert;
  sjt_scores: Record<
    string,
    { pct: number; points: number; max: number }
  > | null;
  committee_note: string | null;
  passport_validated: number;
};

/** League portal: the committee's reports of the recruitment assessment. */
export default function AssessmentsDesk() {
  const { t } = useBatteryCopy();
  const [open, setOpen] = useState<string | null>(null);
  const { data: rows = [] } = useQuery({
    queryKey: ["recruitment-assessments-desk"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "recruitment_assessments_desk",
      );
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{t.disclaimer}</p>
      {rows.map((r) => (
        <div key={r.id} className="rounded-xl border p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium">{r.full_name || r.email}</p>
              <p className="text-xs text-muted-foreground">
                {r.niches.map((n) => t.niches[n as Niche]).join(" · ")}
              </p>
            </div>
            {r.completed_at ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setOpen(open === r.id ? null : r.id)}
              >
                {t.report}
              </Button>
            ) : (
              <Badge variant="secondary">{t.inProgress}</Badge>
            )}
          </div>
          {open === r.id && <ReportView r={r} />}
        </div>
      ))}
    </div>
  );
}

function ReportView({ r }: { r: Row }) {
  const { t, lang } = useBatteryCopy();
  const qc = useQueryClient();
  const [note, setNote] = useState(r.committee_note ?? "");
  const rep = buildReport(r.likert, r.started_at, r.completed_at);
  const v = rep.validity;
  const core = r.sjt_scores?.core?.pct ?? null;
  const watch: string[] = [];
  if (rep.traits.H.level === "low") watch.push(t.hLow);
  if (core != null && core < 60) watch.push(t.sjtLow);
  if (
    rep.who5.total?.band?.level === "high" ||
    rep.k6.total?.band?.level === "high"
  )
    watch.push(t.wellLow);
  const divisions = suggestedDivisions(rep.traits, core);
  const save = async () => {
    const { error } = await supabase.rpc("recruitment_assessment_note", {
      _assessment: r.id,
      _note: note,
    });
    if (error) return toast.error(error.message);
    toast.success("✓");
    qc.invalidateQueries({ queryKey: ["recruitment-assessments-desk"] });
  };
  return (
    <div className="space-y-4 border-t pt-3 text-sm">
      <section
        className={`rounded-lg p-3 text-xs ${v.caution ? "bg-amber-50 dark:bg-amber-950/30" : "bg-emerald-50 dark:bg-emerald-950/30"}`}
      >
        <p className="font-medium flex items-center gap-1">
          {v.caution ? (
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          )}
          {t.validity} — {v.caution ? t.caution : t.validityOk}
        </p>
        <ul className="list-disc ps-5">
          {v.attentionFailed > 0 && <li>{t.attention(v.attentionFailed)}</li>}
          <li>{t.inconsistency(v.inconsistency)}</li>
          {v.straightLining && <li>{t.straight}</li>}
          {v.tooFast && <li>{t.tooFast}</li>}
        </ul>
      </section>

      <section className="space-y-1">
        <p className="font-medium">{t.sjt}</p>
        {Object.entries(r.sjt_scores ?? {}).map(([m, s]) => (
          <p key={m} className="text-xs">
            {m === "core" ? t.module.core : t.niches[m as Niche]} :{" "}
            <span className="font-semibold">{s.pct} %</span> ({s.points}/{s.max}
            )
          </p>
        ))}
        <p className="text-xs text-muted-foreground">
          {t.passport(r.passport_validated)}
        </p>
      </section>

      <TraitBars traits={rep.traits} />

      <section className="grid gap-2 sm:grid-cols-2">
        {[
          [t.wellbeing, rep.who5],
          [t.distress, rep.k6],
        ].map(([label, res]) => {
          const x = res as typeof rep.who5;
          return (
            <div
              key={label as string}
              className="rounded-lg border p-2 text-xs"
            >
              <p className="text-muted-foreground">{label as string}</p>
              <p className="font-medium">
                {x.total?.score}
                {x.total?.band && ` — ${tr(x.total.band.label, lang)}`}
              </p>
            </div>
          );
        })}
      </section>

      {divisions.length > 0 && (
        <section className="text-xs">
          <p className="font-medium">{t.divisions}</p>
          <p>{divisions.map((d) => t.divisionNames[d]).join(" · ")}</p>
        </section>
      )}
      {watch.length > 0 && (
        <section className="text-xs">
          <p className="font-medium">{t.watch}</p>
          <ul className="list-disc ps-5">
            {watch.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-2 print:hidden">
        <Textarea
          rows={3}
          placeholder={t.note}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={save}>
            {t.saveNote}
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 me-1" /> {t.printReport}
          </Button>
        </div>
      </section>
    </div>
  );
}
