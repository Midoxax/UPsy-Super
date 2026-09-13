import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "@/lib/router-compat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, Circle, Loader2, ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import {
  useAcademyAccess,
  useStartAcademyCheckout,
} from "@/hooks/useAcademyAccess";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function LearnCourse() {
  const { slug } = useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeIdx, setActiveIdx] = useState(0);
  const { hasAccess } = useAcademyAccess();
  const startCheckout = useStartAcademyCheckout();

  const { data, isLoading } = useQuery({
    queryKey: ["learn-course", slug],
    queryFn: async () => {
      const { data: course, error } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug!)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      if (!course) return null;
      const [{ data: modules }, enr] = await Promise.all([
        supabase
          .from("course_modules")
          .select("*")
          .eq("course_id", course.id)
          .order("order_index"),
        user
          ? supabase
              .from("course_enrollments")
              .select("*")
              .eq("user_id", user.id)
              .eq("course_id", course.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      return { course, modules: modules ?? [], enrollment: enr.data };
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (!user || !data?.course) return;
    if (data.enrollment) return;
    supabase
      .from("course_enrollments")
      .insert({
        user_id: user.id,
        course_id: data.course.id,
        progress_percent: 0,
      })
      .then(() => {
        qc.invalidateQueries({ queryKey: ["learn-course", slug] });
      });
  }, [user, data?.course?.id]);

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  if (!data?.course) return <Navigate to="/learn" replace />;

  const { course, modules, enrollment } = data;
  const completed = new Set<string>(enrollment?.completed_modules ?? []);
  const progress = modules.length
    ? Math.round((completed.size / modules.length) * 100)
    : 0;
  const active = modules[activeIdx];
  const isCourseLocked = course.is_academy_premium && !hasAccess;
  const isActiveLocked = isCourseLocked && !active?.is_free_preview;

  const toggleComplete = async (mid: string) => {
    if (!user || !enrollment) return;
    const next = new Set(completed);
    if (next.has(mid)) next.delete(mid);
    else next.add(mid);
    const arr = Array.from(next);
    const newProg = modules.length
      ? Math.round((arr.length / modules.length) * 100)
      : 0;
    const isDone = arr.length === modules.length;
    const { error } = await supabase
      .from("course_enrollments")
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
      <SEOHead
        path={`/learn/${slug}`}
        title={`${course.title} | U.Psy Academy`}
        description={course.description ?? undefined}
      />

      {course.instructor_name && (
        <section className="bg-[#0b0c10] text-white">
          <div className="container-custom py-10 md:py-14 flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-white/20">
              <AvatarImage
                src={course.instructor_avatar_url ?? undefined}
                alt={course.instructor_name}
              />
              <AvatarFallback className="text-xl">
                {initials(course.instructor_name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <Badge
                variant="outline"
                className="border-white/20 text-white/70 bg-white/5"
              >
                {course.learning_path}
              </Badge>
              <h1 className="text-2xl md:text-3xl font-display">
                {course.title}
              </h1>
              <p className="text-sm text-white/70">
                Taught by{" "}
                <span className="font-medium text-white">
                  {course.instructor_name}
                </span>
                {course.instructor_title ? ` — ${course.instructor_title}` : ""}
              </p>
            </div>
          </div>
        </section>
      )}

      <main className="container-custom py-8 md:py-12">
        <Link
          to="/learn"
          className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-3 w-3" /> All courses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="space-y-3">
            {!course.instructor_name && (
              <div>
                <Badge variant="outline" className="mb-2">
                  {course.learning_path}
                </Badge>
                <h1 className="text-xl font-display font-semibold">
                  {course.title}
                </h1>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {course.description}
            </p>
            {user && (
              <div className="space-y-1">
                <Progress value={progress} className="h-1.5" />
                <p className="text-[11px] text-muted-foreground">
                  {progress}% complete
                </p>
              </div>
            )}
            {isCourseLocked && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2">
                <p className="text-xs font-medium flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" /> Academy course
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Join Academy all-access to unlock every module.
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => startCheckout.mutate("monthly")}
                  disabled={startCheckout.isPending}
                >
                  {startCheckout.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : null}
                  Join the Academy
                </Button>
              </div>
            )}
            <div className="space-y-1 pt-2">
              {modules.map((m: any, i: number) => {
                const moduleLocked = isCourseLocked && !m.is_free_preview;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveIdx(i)}
                    className={`w-full text-left flex items-start gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      i === activeIdx
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-surface"
                    }`}
                  >
                    {moduleLocked ? (
                      <Lock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    ) : completed.has(m.id) ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <span
                      className={`flex-1 ${moduleLocked ? "text-muted-foreground" : ""}`}
                    >
                      {i + 1}. {m.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <article className="rounded-2xl border border-border bg-surface p-6 space-y-4 min-h-[400px]">
            {!active ? (
              <p className="text-muted-foreground">
                No modules in this course yet.
              </p>
            ) : isActiveLocked ? (
              <div className="flex flex-col items-center justify-center text-center gap-4 py-16">
                <Lock className="h-10 w-10 text-primary/50" />
                <div>
                  <h2 className="text-xl font-display">{active.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    This lesson is part of Academy all-access.
                  </p>
                </div>
                <Button
                  onClick={() => startCheckout.mutate("monthly")}
                  disabled={startCheckout.isPending}
                >
                  {startCheckout.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Unlock with Academy
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-display">{active.title}</h2>
                {active.video_url && (
                  <div className="aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe
                      src={active.video_url}
                      title={active.title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
                {active.content && (
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {active.content}
                  </div>
                )}
                {user && enrollment && (
                  <div className="flex justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
                      disabled={activeIdx === 0}
                    >
                      Previous
                    </Button>
                    <Button size="sm" onClick={() => toggleComplete(active.id)}>
                      {completed.has(active.id)
                        ? "Mark incomplete"
                        : "Mark complete"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setActiveIdx(
                          Math.min(modules.length - 1, activeIdx + 1),
                        )
                      }
                      disabled={activeIdx >= modules.length - 1}
                    >
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
