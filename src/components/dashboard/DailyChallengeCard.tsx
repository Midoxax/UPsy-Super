import { useDailyChallenge, useCompleteDailyChallenge } from "@/hooks/useGamification";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/router-compat";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Ember } from "@/lib/motion";

export const DailyChallengeCard = () => {
  const { data, isLoading } = useDailyChallenge();
  const complete = useCompleteDailyChallenge();

  if (isLoading || !data) {
    return (
      <div className="glass-card p-5 animate-pulse h-32" />
    );
  }

  const c = data.challenge;
  const done = data.completed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 space-y-3"
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0">{c.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
              Today's Challenge
            </span>
          </div>
          <h3 className="font-semibold text-foreground leading-snug">{c.title}</h3>
          {c.description && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{c.description}</p>
          )}
        </div>
        <span className="text-xs font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 whitespace-nowrap">
          +{c.xp_reward} XP
        </span>
      </div>

      <div className="flex gap-2 pt-1">
        {done ? (
          <Ember className="flex-1">
            <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" /> Completed today
            </div>
          </Ember>
        ) : (
          <>
            {c.action_url && (
              <Button variant="secondary" size="sm" asChild className="flex-1">
                <Link to={c.action_url}>
                  Go <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => complete.mutate(data.user_challenge_id)}
              disabled={complete.isPending}
              className="flex-1"
            >
              Mark done
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default DailyChallengeCard;