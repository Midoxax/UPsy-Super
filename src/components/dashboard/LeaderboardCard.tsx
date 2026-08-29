import { useLeaderboard } from "@/hooks/useGamification";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const RANK_COLORS: Record<number, string> = {
  1: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  2: "text-slate-400 bg-slate-400/10 border-slate-400/30",
  3: "text-orange-600 bg-orange-600/10 border-orange-600/30",
};

export const LeaderboardCard = () => {
  const { data: rows = [], isLoading } = useLeaderboard();
  const { user } = useAuth();

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-amber-500" />
        <h3 className="text-h3">Weekly Leaderboard</h3>
        <span className="ml-auto text-[11px] text-muted-foreground">Top performers this week</span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Be the first to earn XP this week!
        </p>
      ) : (
        <ol className="space-y-1.5">
          {rows.map((r) => {
            const isMe = r.user_id === user?.id;
            const rankClass = RANK_COLORS[r.rank] ?? "text-muted-foreground bg-muted/30 border-border";
            return (
              <li
                key={r.user_id}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-xl transition-colors",
                  isMe ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/30"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border",
                  rankClass
                )}>
                  {r.rank <= 3 ? ["🥇","🥈","🥉"][r.rank - 1] : r.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {isMe ? "You" : r.display_name}
                  </p>
                  {r.streak_days > 0 && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" /> {r.streak_days}d streak
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-amber-600">
                  <Zap className="w-3.5 h-3.5" />
                  <span className="text-sm font-bold">{r.xp_this_week}</span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export default LeaderboardCard;