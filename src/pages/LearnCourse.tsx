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
import { useLocalizedField } from "@/lib/i18n/localizedField";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import LessonMarkdown from "@/components/academy/LessonMarkdown";

const COPY = {
  en: {
    done: "🎉 Course completed!",
    all: "All courses",
    complete: "complete",
    locked: "Academy course",
    lockedBody: "{t.lockedBody}",
    join: "Join the Academy",
    empty: "{t.empty}",
    lessonLocked: "{t.lessonLocked}",
    unlock: "Unlock with Academy",
    prev: "Previous",
    next: "Next",
    mark: "Mark complete",
    unmark: "Mark incomplete",
    min: "min",
  },
  fr: {
    done: "🎉 Cours terminé !",
    all: "Tous les cours",
    complete: "terminé",
    locked: "Cours de l'Académie",
    lockedBody: "Rejoignez l'Académie pour débloquer tous les modules.",
    join: "Rejoindre l'Académie",
    empty: "Ce cours n'a pas encore de module.",
    lessonLocked: "Cette leçon fait partie de l'accès complet à l'Académie.",
    unlock: "Débloquer avec l'Académie",
    prev: "Précédent",
    next: "Suivant",
    mark: "Marquer comme terminé",
    unmark: "Marquer comme non terminé",
    min: "min",
  },
  ar: {
    done: "🎉 أكملت الدورة!",
    all: "كل الدورات",
    complete: "مكتمل",
    locked: "دورة الأكاديمية",
    lockedBody: "انضم إلى الأكاديمية لفتح جميع الوحدات.",
    join: "انضم إلى الأكاديمية",
    empty: "لا توجد وحدات في هذه الدورة بعد.",
    lessonLocked: "هذا الدرس ضمن الاشتراك الكامل في الأكاديمية.",
    unlock: "افتح مع الأكاديمية",
    prev: "السابق",
    next: "التالي",
    mark: "تحديد كمكتمل",
    unmark: "إلغاء الإكمال",
    min: "د",
  },
} as const;

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
  const loc = useLocalizedField();
  const { locale } = useLocale();
  const t = COPY[locale === "ar" ? "ar" : locale === "en" ? "en" : "fr"];
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
    if (isDone) toast.success(t.done);
    qc.invalidateQueries({ queryKey: ["learn-course", slug] });
  };

  return (
    <>
      <SEOHead
        path={`/learn/${slug}`}
        title={`${loc(course, "title")} | U.Psy Academy`}
        description={loc(course, "description") || undefined}
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
                {loc(course, "title")}
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
          to={addLocalePrefix("/learn", locale)}
          className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-3 w-3" /> {t.all}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="space-y-3">
            {!course.instructor_name && (
              <div>
                <Badge variant="outline" className="mb-2">
                  {course.learning_path}
                </Badge>
                <h1 className="text-xl font-display font-semibold">
                  {loc(course, "title")}
                </h1>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {loc(course, "description")}
            </p>
            {user && (
              <div className="space-y-1">
                <Progress value={progress} className="h-1.5" />
                <p className="text-[11px] text-muted-foreground">
                  {progress}% {t.complete}
                </p>
              </div>
            )}
            {isCourseLocked && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2">
                <p className="text-xs font-medium flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" /> {t.locked}
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
                  {t.join}
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
                      {i + 1}. {loc(m, "title")}
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
                  <h2 className="text-xl font-display">
                    {loc(active, "title")}
                  </h2>
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
                  {t.unlock}
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-display">
                  {loc(active, "title")}
                </h2>
                {active.duration_minutes ? (
                  <p className="text-xs text-muted-foreground">
                    {active.duration_minutes} {t.min}
                  </p>
                ) : null}
                {active.video_url && (
                  <div className="aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe
                      src={active.video_url}
                      title={loc(active, "title")}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
                {loc(active, "content") && (
                  <LessonMarkdown>{loc(active, "content")}</LessonMarkdown>
                )}
                {user && enrollment && (
                  <div className="flex justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
                      disabled={activeIdx === 0}
                    >
                      {t.prev}
                    </Button>
                    <Button size="sm" onClick={() => toggleComplete(active.id)}>
                      {completed.has(active.id) ? t.unmark : t.mark}
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
                      {t.next}
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
