import { Check, Sparkles, Target, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  type Quest,
  type UserQuestProgress,
  questCompletionPct,
  useStartQuest,
} from "@/hooks/useProgression";
import { hasTier, useCurrentTier, TIER_LABEL } from "@/hooks/useMembership";
import { Link } from "@/lib/router-compat";

interface Props {
  quest: Quest;
  progress?: UserQuestProgress | null;
}

export const QuestCard = ({ quest, progress }: Props) => {
  const start = useStartQuest();
  const { tier } = useCurrentTier();
  const allowed = hasTier(tier, quest.tier_required);
  const pct = questCompletionPct(quest, progress);
  const isComplete = !!progress?.completed_at;
  const counts = progress?.state?.counts ?? {};

  return (
    <Card
      className={`p-5 flex flex-col gap-4 border-border/50 bg-gradient-to-br
        ${isComplete ? "from-primary/10 to-accent/5" : "from-card to-muted/10"}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Target className="h-4 w-4 text-primary shrink-0" />
            <h4 className="font-semibold text-base">{quest.title}</h4>
            <Badge variant="outline" className="text-[10px]">
              {quest.category}
            </Badge>
          </div>
          {quest.description && (
            <p className="text-sm text-muted-foreground">{quest.description}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3 w-3" />
            {quest.xp_reward} XP
          </div>
          {quest.tier_required !== "discover" && (
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {TIER_LABEL[quest.tier_required]}+
            </div>
          )}
        </div>
      </header>

      <div>
        <Progress value={pct} className="h-1.5" />
        <div className="mt-1 text-[11px] text-muted-foreground">{pct}% complete</div>
      </div>

      <ul className="space-y-1.5">
        {quest.steps.map((s) => {
          const done = Math.min(counts[s.id] ?? 0, s.target);
          const stepDone = done >= s.target;
          return (
            <li
              key={s.id}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <span className="flex items-center gap-2 min-w-0">
                {stepDone ? (
                  <Check className="h-3 w-3 text-primary shrink-0" />
                ) : (
                  <span className="h-3 w-3 rounded-full border border-border shrink-0" />
                )}
                <span className={stepDone ? "line-through text-muted-foreground" : ""}>
                  {s.label}
                </span>
              </span>
              <span className="text-muted-foreground tabular-nums shrink-0">
                {done}/{s.target}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto">
        {isComplete ? (
          <Badge className="w-full justify-center py-2" variant="secondary">
            <Check className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        ) : !allowed ? (
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to="/membership">
              <Lock className="h-3 w-3 mr-1" />
              Unlock with {TIER_LABEL[quest.tier_required]}
            </Link>
          </Button>
        ) : !progress ? (
          <Button
            size="sm"
            className="w-full"
            disabled={start.isPending}
            onClick={() => start.mutate(quest.slug)}
          >
            Start quest
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="w-full" disabled>
            In progress
          </Button>
        )}
      </div>
    </Card>
  );
};