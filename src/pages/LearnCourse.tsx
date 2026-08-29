import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "@/lib/router-compat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";

export default function LearnCourse() {
  const { slug } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeIdx, setActiveIdx] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["learn-course", slug],
    queryFn: async () => {
      const { data: course, error } = await supabase
        .from("courses").select("*").eq("slug", slug!).eq("is_published", true).maybeSingle();
      if (error) throw error;
      if (!course) return null;
      const [{ data: modules }, enr] = await Promise.all([
        supabase.from("course_modules").select("*").eq("course_id", course.id).order("order_index"),
        user
          ? supabase.from("course_enrollments").select("*").eq("user_id", user.id).eq("course_id", course.id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      return { course, modules: modules ?? [], enrollment: enr.data };
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (!user || !data?.course) return;
    if (data.enrollment) return;
    supabase.from("course_enrollments").insert({ user_id: user.id, course_id: data.course.id, progress_percent: 0 }).then(() => {
      qc.invalidateQueries({ queryKey: ["learn-course", slug] });
    });
  }, [user, data?.course?.id]);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!data?.course) return <Navigate to="/learn" replace />;

  const { course, modules, enrollment } = data;
  const completed = new Set<string>(enrollment?.completed_modules ?? []);
  const progress = modules.length ? Math.round((completed.size / modules.length) * 100) : 0;
  const active = modules[activeIdx];

  const toggleComplete = async (mid: string) => {
    if (!user || !enrollment) return;
    const next = new Set(completed);
    next.has(mid) ? next.delete(mid) : next.add(mid);
    const arr = Array.from(next);
    const newProg = modules.length ? Math.round((arr.length / modules.length) * 100) : 0;
    const isDone = arr.length === modules.length;
    const { error } = await supabase.from("course_enrollments")
      .update({
        completed_modules: arr,
        progress_percent: newProg,
        completed_at: isDone ? new Date().toISOString() : null,
      })
      .eq("id", enrollment.id);
    if (error) return toast.error(error.message);
    if (isDone) toast.success("🎉 Course completed!");
    qc.invalidateQueries({ queryKey: ["learn-course", slug] });
  };

  return (
    <>
      <SEOHead path={`/learn/${slug}`} />
      <main className="container-custom py-8 md:py-12">
        <Link to="/learn" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-4">
          <ArrowLeft className="h-3 w-3" /> All courses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="space-y-3">
            <div>
              <Badge variant="outline" className="mb-2">{course.learning_path}</Badge>
              <h1 className="text-xl font-display font-semibold">{course.title}</h1>
              <p className="text-xs text-muted-foreground mt-1">{course.description}</p>
            </div>
            {user && (
              <div className="space-y-1">
                <Progress value={progress} className="h-1.5" />
                <p className="text-[11px] text-muted-foreground">{progress}% complete</p>
              </div>
            )}
            <div className="space-y-1 pt-2">
              {modules.map((m: any, i: number) => (
                <button
                  key={m.id}
                  onClick={() => setActiveIdx(i)}
                  className={`w-full text-left flex items-start gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    i === activeIdx ? "bg-primary/10 text-primary" : "hover:bg-surface"
                  }`}
                >
                  {completed.has(m.id) ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  )}
                  <span className="flex-1">{i + 1}. {m.title}</span>
                </button>
              ))}
            </div>
          </aside>

          <article className="rounded-2xl border border-border bg-surface p-6 space-y-4 min-h-[400px]">
            {!active ? (
              <p className="text-muted-foreground">No modules in this course yet.</p>
            ) : (
              <>
                <h2 className="text-2xl font-display">{active.title}</h2>
                {active.video_url && (
                  <div className="aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe src={active.video_url} title={active.title} className="w-full h-full" allowFullScreen />
                  </div>
                )}
                {active.content && (
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{active.content}</div>
                )}
                {user && enrollment && (
                  <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))} disabled={activeIdx === 0}>
                      Previous
                    </Button>
                    <Button size="sm" onClick={() => toggleComplete(active.id)}>
                      {completed.has(active.id) ? "Mark incomplete" : "Mark complete"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setActiveIdx(Math.min(modules.length - 1, activeIdx + 1))} disabled={activeIdx >= modules.length - 1}>
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </article>
        </div>
      </main>
    </>
  );
}