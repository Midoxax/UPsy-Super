import { ClipboardCheck, Clock } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import type { AthleteAssessment } from "@/hooks/useAthleteHub";
import { useHubCopy, fmtDate } from "@/components/athlete/copy";

export default function AssessmentsPanel({
  assessments,
}: {
  assessments: AthleteAssessment[];
}) {
  const c = useHubCopy();
  const { locale } = useLocale();
  return (
    <div className="glass-card p-5 sm:p-6 space-y-4">
      <p className="text-sm text-muted-foreground">{c.assessIntro}</p>
      <div className="grid gap-3 md:grid-cols-3">
        {assessments.map((a) => (
          <div
            key={a.id}
            className="rounded-xl border border-border/40 p-4 flex flex-col gap-3"
          >
            <div className="flex items-start gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="font-medium text-foreground">{a.title}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-[10px]">
                {c.questions(a.question_count)}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                <Clock className="w-3 h-3 mr-1" />
                {a.estimated_minutes} {c.minutes}
              </Badge>
            </div>
            {a.last?.completed_at && (
              <p className="text-xs text-muted-foreground">
                {c.lastScore}:{" "}
                <span className="font-semibold text-foreground">
                  {a.last.total_score ?? "—"}
                </span>{" "}
                · {fmtDate(c, a.last.completed_at)}
              </p>
            )}
            <Button
              asChild
              variant={a.last ? "outline" : "primary"}
              className="mt-auto w-full"
            >
              <Link
                to={addLocalePrefix(`/assessment-lab?start=${a.id}`, locale)}
              >
                {a.last ? c.retake : c.takeIt}
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
