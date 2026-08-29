import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserProgress, useUserBadges, useAllBadges, useLevels, getLevelInfo, RARITY_STYLES } from "@/hooks/useGamification";
import { Flame, Star, Zap, ChevronRight, Lock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const LevelBar = () => {
  const { data: progress } = useUserProgress();
  const { data: levels = [] } = useLevels();

  if (!progress || levels.length === 0) return null;

  const { current, next, xpIntoLevel, xpNeededForNext, pct } = getLevelInfo(levels, progress.xp_total);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground"
            style={{ background: current.color }}
          >
            {current.level}
          </div>
          <span className="text-sm font-semibold">{current.name_fr ?? current.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs font-semibold text-amber-600">{progress.xp_total.toLocaleString()} XP</span>
        </div>
      </div>

      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: current.color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }}
        />
        <motion.div
          className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
          animate={{ x: ["-100%", "400%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
          style={{ left: 0 }}
        />
      </div>

      {next && (
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>{xpIntoLevel} / {xpNeededForNext} XP</span>
          <span>Next: {next.name_fr ?? next.name}</span>
        </div>
      )}
    </div>
  );
};

const StreakDisplay = () => {
  const { data: progress } = useUserProgress();
  if (!progress || progress.streak_days < 1) return null;

  const isOnFire = progress.streak_days >= 7;

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl border",
      isOnFire ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-surface"
    )}>
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0",
        isOnFire ? "bg-amber-500/15" : "bg-muted"
      )}>
        {isOnFire ? "🔥" : "✨"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">
          {progress.streak_days} day{progress.streak_days > 1 ? "s" : ""} streak
        </p>
        <p className="text-xs text-muted-foreground">
          Best: {progress.streak_best} days
        </p>
      </div>
      {isOnFire && (
        <div className="text-xs font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
          On fire!
        </div>
      )}
    </div>
  );
};

const BadgeCard = ({
  badge, earned, delay = 0
}: { badge: any; earned: boolean; delay?: number }) => {
  const [showTip, setShowTip] = useState(false);
  const style = RARITY_STYLES[badge.rarity as keyof typeof RARITY_STYLES] ?? RARITY_STYLES.common;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, type: "spring", stiffness: 200 }}
      className="relative"
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <div className={cn(
        "w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl transition-all cursor-default",
        earned
          ? cn(style.border, style.bg, style.glow, "opacity-100")
          : "border-border bg-muted/50 opacity-40 grayscale"
      )}>
        {earned ? badge.icon : <Lock className="h-4 w-4 text-muted-foreground/50" />}
      </div>

      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-background border border-border rounded-xl p-3 shadow-lg z-20 pointer-events-none"
          >
            <p className="text-xs font-semibold">{badge.name_fr ?? badge.name}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              {badge.description_fr ?? badge.description}
            </p>
            <div className={cn("text-[10px] font-bold mt-1.5 uppercase tracking-wide", style.text)}>
              {badge.rarity} · +{badge.xp_reward} XP
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const GamificationPanel = () => {
  const { data: earnedBadges = [] } = useUserBadges();
  const { data: allBadges = [] } = useAllBadges();
  const { data: progress } = useUserProgress();
  const [showAll, setShowAll] = useState(false);

  const earnedSlugs = new Set(earnedBadges.map((b) => b.slug));
  const badgesToShow = showAll ? allBadges : allBadges.slice(0, 8);

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold">My Progress</span>
        </div>
        {progress && (
          <span className="text-xs text-muted-foreground">
            {earnedBadges.length}/{allBadges.length} badges
          </span>
        )}
      </div>

      <LevelBar />
      <StreakDisplay />

      {progress && (
        <div className="flex items-center justify-between text-sm border-t border-border/50 pt-4">
          <span className="text-muted-foreground text-xs">XP this week</span>
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-amber-500" />
            <span className="text-xs font-bold text-amber-600">+{progress.xp_this_week}</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Badges</p>
        <div className="flex flex-wrap gap-2">
          {badgesToShow.map((badge, i) => (
            <BadgeCard
              key={badge.slug}
              badge={badge}
              earned={earnedSlugs.has(badge.slug)}
              delay={i * 0.04}
            />
          ))}
        </div>
        {allBadges.length > 8 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            {showAll ? "Show less" : `View all (${allBadges.length})`}
            <ChevronRight className={cn("h-3 w-3 transition-transform", showAll && "rotate-90")} />
          </button>
        )}
      </div>
    </div>
  );
};

export default GamificationPanel;
