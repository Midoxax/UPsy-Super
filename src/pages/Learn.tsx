import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@/lib/router-compat";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import SEOHead from "@/components/SEOHead";

const PATH_STYLE: Record<string, string> = {
  "mental-health": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "performance": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "clinical-cpd": "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

export default function Learn() {
  const { user } = useAuth();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["public-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["my-enrollments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const enrollmentByCourse = new Map(enrollments.map((e: any) => [e.course_id, e]));

  const grouped = courses.reduce((acc: Record<string, any[]>, c: any) => {
    const k = c.learning_path ?? "mental-health";
    (acc[k] ||= []).push(c);
    return acc;
  }, {});

  const sectionTitle: Record<string, string> = {
    "mental-health": "Mental Health & Wellbeing",
    "performance": "Performance Psychology",
    "clinical-cpd": "Clinical CPD",
  };

  return (
    <>
      <SEOHead
        path="/learn"
        title="Learn — Mental Health Courses & Paths | U.Psy"
        description="Structured learning paths on mental health, resilience, and performance psychology — built by U.Psy clinicians for everyday life."
      />
      <main className="container-custom py-12 md:py-16 space-y-12">
        <header className="max-w-2xl">
          <Badge variant="outline" className="mb-3">Learning & Performance Hub</Badge>
          <h1 className="text-4xl md:text-5xl font-display tracking-tight mb-3">
            Build your inner edge.
          </h1>
          <p className="text-muted-foreground">
            Evidence-based programs across mental health, performance psychology, and clinical CPD —
            curated by the U.Psy clinical team.
          </p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-2xl">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No published courses yet — check back soon.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([path, items]) => (
            <section key={path} className="space-y-4">
              <h2 className="text-2xl font-display">{sectionTitle[path] ?? path}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((c: any) => {
                  const enr: any = enrollmentByCourse.get(c.id);
                  const progress = Number(enr?.progress_percent ?? 0);
                  return (
                    <Link
                      key={c.id}
                      to={`/learn/${c.slug}`}
                      className="rounded-2xl border border-border bg-surface hover:border-primary/40 transition-all overflow-hidden group"
                    >
                      {c.thumbnail_url ? (
                        <img src={c.thumbnail_url} alt={c.title} className="w-full h-40 object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <BookOpen className="h-10 w-10 text-primary/40" />
                        </div>
                      )}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Badge className={cn("text-[10px] border", PATH_STYLE[c.learning_path] ?? "")}>
                            {c.learning_path}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {c.duration_hours ?? 1}h
                          </span>
                        </div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{c.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                        {enr && (
                          <div className="pt-2 space-y-1">
                            <Progress value={progress} className="h-1.5" />
                            <p className="text-[10px] text-muted-foreground">
                              {enr.completed_at ? "Completed" : `${progress}% complete`}
                            </p>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>
    </>
  );
}