import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { BookOpen, ArrowRight, PlayCircle } from "lucide-react";

export default function ContinueLearningCard({ path }: { path?: "mental-health" | "performance" | "clinical-cpd" }) {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["continue-learning", user?.id, path],
    enabled: !!user,
    queryFn: async () => {
      const { data: enrs } = await supabase
        .from("course_enrollments")
        .select("*, courses(*)")
        .eq("user_id", user!.id)
        .is("completed_at", null)
        .order("started_at", { ascending: false })
        .limit(5);
      const list = (enrs ?? []).filter((e: any) => !path || e.courses?.learning_path === path);
      const enr = list[0];
      if (!enr) return null;
      // Find next module = first not in completed_modules, ordered by order_index
      const { data: modules } = await supabase
        .from("course_modules")
        .select("id, title, order_index")
        .eq("course_id", enr.course_id)
        .order("order_index", { ascending: true });
      const completed = new Set<string>(enr.completed_modules ?? []);
      const total = modules?.length ?? 0;
      const completedCount = (modules ?? []).filter((m) => completed.has(m.id)).length;
      const nextModule = (modules ?? []).find((m) => !completed.has(m.id)) ?? null;
      return { enrollment: enr, nextModule, total, completedCount };
    },
  });

  if (!data) return null;
  const { enrollment, nextModule, total, completedCount } = data as any;
  const c = enrollment.courses;
  const pct = Math.round(Number(enrollment.progress_percent ?? 0));
  return (
    <Link
      to={`/learn/${c.slug}`}
      className="block rounded-2xl border border-border bg-surface hover:border-primary/40 transition-colors p-4 group"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <BookOpen className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Continue learning</p>
          <p className="font-semibold text-sm">{c.title}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <Progress value={pct} className="h-1.5" />
      <div className="flex items-center justify-between mt-1.5 gap-2">
        <p className="text-[10px] text-muted-foreground">
          {pct}% complete{total > 0 ? ` · ${completedCount}/${total} lessons` : ""}
        </p>
        {nextModule && (
          <span className="text-[10px] text-primary inline-flex items-center gap-1 truncate max-w-[60%]">
            <PlayCircle className="h-3 w-3 shrink-0" />
            <span className="truncate">{nextModule.title}</span>
          </span>
        )}
      </div>
    </Link>
  );
}