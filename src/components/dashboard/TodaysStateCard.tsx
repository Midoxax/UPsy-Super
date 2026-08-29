import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/hooks/use-toast";
import CrisisModal from "@/components/dashboard/CrisisModal";
import { Frown, Meh, Smile, Flame, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const MOODS = [
  { score: 1, icon: Frown, color: "text-destructive", label: "veryLow" },
  { score: 2, icon: Frown, color: "text-orange-400", label: "low" },
  { score: 3, icon: Meh, color: "text-muted-foreground", label: "neutral" },
  { score: 4, icon: Smile, color: "text-accent", label: "good" },
  { score: 5, icon: Smile, color: "text-primary", label: "great" },
];

interface Props {
  onLogged?: () => void;
}

export default function TodaysStateCard({ onLogged }: Props) {
  const { user } = useAuth();
  const { t } = useLocale();
  const { toast } = useToast();
  const [streak, setStreak] = useState(0);
  const [recentAvg, setRecentAvg] = useState<number | null>(null);
  const [todayLogged, setTodayLogged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [crisisOpen, setCrisisOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    void loadState();
  }, [user]);

  const loadState = async () => {
    const { data } = await supabase
      .from("mood_entries")
      .select("mood_score, recorded_at")
      .eq("user_id", user!.id)
      .order("recorded_at", { ascending: false })
      .limit(30);

    if (!data) return;

    const today = new Date().toDateString();
    setTodayLogged(data.some((e) => new Date(e.recorded_at ?? 0).toDateString() === today));

    // Streak: consecutive days from today backwards
    let s = 0;
    const days = new Set(data.map((e) => new Date(e.recorded_at ?? 0).toDateString()));
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      if (days.has(d.toDateString())) s++;
      else if (i > 0) break;
    }
    setStreak(s);

    const last3 = data.slice(0, 3);
    if (last3.length) {
      setRecentAvg(last3.reduce((a, b) => a + b.mood_score, 0) / last3.length);
    }
  };

  const logMood = async (score: number) => {
    if (!user || submitting) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("mood_entries")
      .insert({ user_id: user.id, mood_score: score });
    setSubmitting(false);
    if (error) {
      toast({ title: t("dashboard.error") || "Error", variant: "destructive" });
      return;
    }

    // Show crisis modal for very low mood scores
    if (score <= 1) {
      setCrisisOpen(true);
    }

    toast({ title: t("dashboard.moodSaved") || "Check-in saved" });
    await loadState();
    onLogged?.();
  };

  const adaptiveMessage = () => {
    if (todayLogged) return t("dashboard.checkedInToday") || "You've checked in today. Nice work.";
    if (recentAvg === null) return t("dashboard.firstCheckIn") || "How are you feeling right now?";
    if (recentAvg <= 2) return t("dashboard.lowStreak") || "Tough days lately. Be gentle with yourself.";
    if (recentAvg >= 4) return t("dashboard.goodStreak") || "You've had a good stretch. Keep the rhythm.";
    return t("dashboard.steadyState") || "Steady week. One check-in keeps the momentum.";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 space-y-5"
    >
      <CrisisModal open={crisisOpen} onOpenChange={setCrisisOpen} riskLevel="high" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-h3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {t("dashboard.todaysState") || "Today's State"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{adaptiveMessage()}</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Flame className="w-4 h-4" />
            {streak} {streak === 1 ? "day" : "days"}
          </div>
        )}
      </div>

      <div className="flex justify-between gap-2">
        {MOODS.map((m) => (
          <button
            key={m.score}
            disabled={submitting}
            onClick={() => logMood(m.score)}
            className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all hover:bg-muted/40 hover:scale-105 disabled:opacity-50"
            aria-label={t(`mood.${m.label}`) || m.label}
          >
            <m.icon className={`w-8 h-8 ${m.color}`} />
            <span className="text-[10px] text-muted-foreground capitalize">
              {t(`mood.${m.label}`) || m.label}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
