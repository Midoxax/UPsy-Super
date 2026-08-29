import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { Sparkles, BookOpen, Brain, Activity, ArrowRight } from "lucide-react";
import { Link } from "@/lib/router-compat";

interface Recommendation {
  type: "exercise" | "article" | "course";
  title: string;
  description: string;
  href: string;
  reason?: string;
}

const ICONS = {
  exercise: Activity,
  article: BookOpen,
  course: Brain,
};

const FALLBACK: Recommendation[] = [
  {
    type: "exercise",
    title: "5-minute breathing reset",
    description: "Box breathing technique to reduce stress on demand.",
    href: "/resources",
  },
  {
    type: "article",
    title: "Understanding anxiety",
    description: "What anxiety is, why it shows up, and how to respond.",
    href: "/blog/understanding-anxiety",
  },
  {
    type: "course",
    title: "Mindfulness for beginners",
    description: "An 8-session course to build a sustainable practice.",
    href: "/blog/mindfulness-for-beginners",
  },
];

export default function RecommendationsRail() {
  const { user } = useAuth();
  const { t } = useLocale();
  const [recs, setRecs] = useState<Recommendation[]>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("recommend", {
        body: { user_id: user!.id },
      });
      if (!error && data?.recommendations?.length) {
        setRecs(data.recommendations);
      }
    } catch {
      // graceful fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-h3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          {t("dashboard.forYou") || "For you"}
        </h2>
        {loading && <span className="text-xs text-muted-foreground">…</span>}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {recs.slice(0, 3).map((r, i) => {
          const Icon = ICONS[r.type];
          return (
            <Link
              key={i}
              to={r.href}
              className="group p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all border border-transparent hover:border-primary/20"
            >
              <Icon className="w-5 h-5 text-primary mb-3" />
              <p className="text-sm font-medium text-foreground mb-1 line-clamp-2">{r.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
              {r.reason && (
                <p className="text-[10px] text-primary/80 mt-2 italic">{r.reason}</p>
              )}
              <div className="mt-3 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                {t("dashboard.open") || "Open"} <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
