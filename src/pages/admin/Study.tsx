// Investigator view of the athlete study: enrolment counts and the
// pseudonymised exports. Exports carry participant codes only; every call
// is written to the audit trail by the database.

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { downloadCsv } from "@/lib/admin/csv";
import { toast } from "@/hooks/use-toast";
import { INSTRUMENTS } from "@/lib/study/instruments";
import { STUDY } from "@/lib/study/copy";

type Stats = {
  enrolled: number;
  withdrawn: number;
  responses: number;
  responses_7d: number;
};

const PAGE = 1000; // PostgREST returns at most this many rows per request.

const CODEBOOK: [string, string][] = [
  [
    "sleep_1..3",
    "Hours per night (0-14), sleep quality 0-10 (SQS), nights with difficulty (0-7). sleep_score = quality.",
  ],
  [
    "who5_1..5",
    "0-5 each. who5_raw = sum (0-25); who5_score = raw × 4 (0-100). ≤ 28 likely depression, ≤ 50 poor well-being.",
  ],
  [
    "pss10_1..10",
    "0-4 each, as answered. pss10_score reverses items 4, 5, 7, 8 (0-40).",
  ],
  [
    "abq_1..15",
    "1-5 each, as answered. Items 1 and 14 reversed in scores. Subscale means: abq_exhaustion (2,4,8,10,12), abq_reduced_accomplishment (1,5,7,13,14), abq_devaluation (3,6,9,11,15); abq_score = mean of 15.",
  ],
  ["mti_1..8", "1-7 each. mti_score = sum (8-56)."],
  [
    "readiness_*",
    "Daily check-in: score 0-100; mood, sleep, stress, energy, cognitive_load 1-10. Africa/Casablanca calendar day.",
  ],
  [
    "competition_*",
    "importance 1-3 and self-rated performance 1-10, on the event date.",
  ],
];

export default function AdminStudy() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    supabase.rpc("study_stats").then(({ data }) => setStats(data as Stats));
  }, []);

  const exportAll = async (fn: "study_export" | "study_participants") => {
    setBusy(fn);
    const rows: Record<string, unknown>[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .rpc(fn)
        .range(from, from + PAGE - 1);
      if (error) {
        toast({
          title: "Export failed",
          description: error.message,
          variant: "destructive",
        });
        setBusy(null);
        return;
      }
      rows.push(...(data ?? []));
      if (!data || data.length < PAGE) break;
    }
    setBusy(null);
    const day = new Date().toISOString().slice(0, 10);
    if (!rows.length) toast({ title: "Nothing to export yet" });
    else
      downloadCsv(
        `upsy-study-${fn === "study_export" ? "data" : "participants"}-${day}`,
        rows,
      );
  };

  return (
    <main className="flex-1">
      <SEOHead
        path="/admin/study"
        title="Athlete study — U.Psy internal"
        description="Enrolment and pseudonymised exports for the athlete well-being study."
      />
      <div className="container-custom py-8 space-y-8">
        <header>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Research
          </p>
          <h1 className="text-3xl md:text-4xl font-heading mt-1">
            Athlete well-being study
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Longitudinal well-being and performance. Consent version{" "}
            {STUDY.CONSENT_VERSION}
            {STUDY.ETHICS_REF
              ? `, ethics ${STUDY.ETHICS_REF}`
              : ", ethics approval pending"}
            .
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(
            [
              ["Active participants", stats?.enrolled],
              ["Withdrawn", stats?.withdrawn],
              ["Questionnaires", stats?.responses],
              ["Last 7 days", stats?.responses_7d],
            ] as const
          ).map(([label, v]) => (
            <div key={label} className="glass-card p-4">
              <p className="text-2xl font-bold tabular-nums">{v ?? "—"}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        <section className="glass-card p-5 space-y-3">
          <h2 className="font-semibold">Exports</h2>
          <p className="text-sm text-muted-foreground">
            Long format: one row per participant code, source, day and item.
            Participants who withdrew with deletion are excluded; others
            contribute data up to their withdrawal date.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="primary"
              disabled={!!busy}
              onClick={() => exportAll("study_export")}
            >
              <Download className="w-4 h-4" />
              {busy === "study_export" ? "Exporting…" : "Data (CSV)"}
            </Button>
            <Button
              variant="outline"
              disabled={!!busy}
              onClick={() => exportAll("study_participants")}
            >
              <Download className="w-4 h-4" />
              {busy === "study_participants"
                ? "Exporting…"
                : "Participants (CSV)"}
            </Button>
          </div>
        </section>

        <section className="glass-card p-5 space-y-3">
          <h2 className="font-semibold">Codebook</h2>
          <dl className="space-y-2 text-sm">
            {CODEBOOK.map(([k, v]) => (
              <div key={k} className="grid sm:grid-cols-[180px_1fr] gap-1">
                <dt className="font-mono text-foreground">{k}</dt>
                <dd className="text-muted-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          <h3 className="font-medium pt-2">Schedule and sources</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            {INSTRUMENTS.map((i) => (
              <li key={i.id}>
                <span className="font-mono text-foreground">{i.id}</span> every{" "}
                {i.everyDays} days from enrolment (baseline at day 0).{" "}
                {i.source}.
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
