import { useMemo } from "react";
import { Printer, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  Checkin,
  Competition,
  Completion,
  Goal,
  JournalEntry,
} from "@/hooks/useAthleteHub";
import { useHubCopy, fmtDate } from "@/components/athlete/copy";
import { summarize, DAY } from "@/components/athlete/stats";

interface Props {
  name: string;
  checkins: Checkin[];
  completions: Completion[];
  goals: Goal[];
  competitions: Competition[];
  journal: JournalEntry[];
}

export default function ProgressReport(props: Props) {
  const c = useHubCopy();
  const s = useMemo(() => summarize(props), [props]);
  const from = new Date(Date.now() - 30 * DAY);

  const Change =
    s.change == null ? Minus : s.change >= 0 ? TrendingUp : TrendingDown;
  const rows: Array<[string, string]> = [
    [c.rCheckins, String(s.checkins)],
    [c.rAvg, s.avg == null ? c.rNoData : `${s.avg}/100`],
    [c.rProtocols, String(s.protocols)],
    [c.rMinutes, String(s.minutes)],
    [c.rGoals, `${s.goalsDone} / ${s.goalsDone + s.goalsActive}`],
    [c.rComps, String(s.comps)],
    [c.rJournal, String(s.journal)],
  ];

  return (
    <div className="glass-card p-5 sm:p-6 space-y-5 print-report">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground print:hidden">
            {c.reportIntro}
          </p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
            {props.name} · {fmtDate(c, from)} – {fmtDate(c, new Date())}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="w-full sm:w-auto print:hidden"
        >
          <Printer className="w-4 h-4" />
          {c.print}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border/40 p-3">
            <p className="text-xl font-bold text-foreground tabular-nums">
              {value}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
        <div className="rounded-xl border border-border/40 p-3">
          <p className="text-xl font-bold text-foreground tabular-nums flex items-center gap-1">
            <Change className="w-5 h-5 text-primary" />
            {s.change == null ? "—" : `${s.change > 0 ? "+" : ""}${s.change}`}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">{c.rChange}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl bg-primary/5 p-3">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            {c.rBest}
          </p>
          <p className="font-medium text-foreground mt-1">
            {s.best ? c.fields[s.best][0] : c.rNoData}
          </p>
        </div>
        <div className="rounded-xl bg-amber-500/10 p-3">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            {c.rWeak}
          </p>
          <p className="font-medium text-foreground mt-1">
            {s.weak ? c.fields[s.weak][0] : c.rNoData}
          </p>
        </div>
      </div>
    </div>
  );
}
