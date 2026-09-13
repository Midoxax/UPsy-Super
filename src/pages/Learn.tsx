import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useSearchParams } from "@/lib/router-compat";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Clock,
  Loader2,
  Lock,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import {
  useAcademyAccess,
  useStartAcademyCheckout,
} from "@/hooks/useAcademyAccess";

const PATH_STYLE: Record<string, string> = {
  "mental-health": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  performance: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "clinical-cpd": "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

const sectionTitle: Record<string, string> = {
  "mental-health": "Mental Health & Wellbeing",
  performance: "Performance Psychology",
  "clinical-cpd": "Clinical CPD",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Learn() {
  const { user } = useAuth();
  const { hasAccess } = useAcademyAccess();
  const startCheckout = useStartAcademyCheckout();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const academyParam = searchParams.get("academy");
    if (academyParam === "success") {
      toast.success(
        "Welcome to the Academy — every premium course is now unlocked.",
      );
      setSearchParams(
        (prev) => {
          prev.delete("academy");
          return prev;
        },
        { replace: true },
      );
    } else if (academyParam === "cancelled") {
      setSearchParams(
        (prev) => {
          prev.delete("academy");
          return prev;
        },
        { replace: true },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const enrollmentByCourse = new Map(
    enrollments.map((e: any) => [e.course_id, e]),
  );

  const instructors = Array.from(
    courses
      .reduce((acc, c: any) => {
        if (!c.instructor_name) return acc;
        if (!acc.has(c.instructor_name)) {
          acc.set(c.instructor_name, {
            name: c.instructor_name,
            title: c.instructor_title,
            avatar: c.instructor_avatar_url,
            firstCourseSlug: c.slug,
            courseCount: 0,
          });
        }
        acc.get(c.instructor_name)!.courseCount += 1;
        return acc;
      }, new Map<string, { name: string; title: string | null; avatar: string | null; firstCourseSlug: string; courseCount: number }>())
      .values(),
  );

  const grouped = courses.reduce((acc: Record<string, any[]>, c: any) => {
    const k = c.learning_path ?? "mental-health";
    (acc[k] ||= []).push(c);
    return acc;
  }, {});

  return (
    <>
      <SEOHead
        path="/learn"
        title="U.Psy Academy — Learn from Morocco's Leading Clinicians"
        description="An all-access academy of structured courses on mental health, resilience, and performance psychology — taught by named U.Psy clinicians."
      />

      {/* Hero — dark, editorial, professor-forward */}
      <section className="relative bg-[#0b0c10] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.12),transparent_55%)]" />
        <div className="container-custom relative py-20 md:py-28 space-y-8">
          <Badge
            variant="outline"
            className="border-white/20 text-white/80 bg-white/5"
          >
            <GraduationCap className="h-3.5 w-3.5 mr-1.5" /> U.Psy Academy
          </Badge>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.05] tracking-tight max-w-3xl">
            Learn directly from the clinicians who shape mental performance in
            Morocco.
          </h1>
          <p className="text-white/70 max-w-xl text-lg">
            Structured, evidence-based courses on mental health, resilience, and
            performance psychology — taught by named U.Psy experts, not
            anonymous slides.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {hasAccess ? (
              <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-4 py-2 text-sm">
                <Sparkles className="h-4 w-4 mr-1.5" /> You have Academy
                all-access
              </Badge>
            ) : (
              <Button
                size="lg"
                className="bg-white text-[#0b0c10] hover:bg-white/90"
                onClick={() => startCheckout.mutate("monthly")}
                disabled={startCheckout.isPending}
              >
                {startCheckout.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4 mr-2" />
                )}
                Join the Academy
              </Button>
            )}
            <a href="#courses">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                Browse free lessons
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Professors */}
      {instructors.length > 0 && (
        <section className="border-b border-border bg-surface/40">
          <div className="container-custom py-14 space-y-6">
            <h2 className="text-2xl md:text-3xl font-display">
              Meet your professors
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {instructors.map((ins) => (
                <Link
                  key={ins.name}
                  to={`/learn/${ins.firstCourseSlug}`}
                  className="group text-center space-y-3"
                >
                  <Avatar className="h-24 w-24 mx-auto border-2 border-transparent group-hover:border-primary transition-colors">
                    <AvatarImage src={ins.avatar ?? undefined} alt={ins.name} />
                    <AvatarFallback className="text-lg">
                      {initials(ins.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold group-hover:text-primary transition-colors">
                      {ins.name}
                    </p>
                    {ins.title && (
                      <p className="text-xs text-muted-foreground">
                        {ins.title}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {ins.courseCount} course{ins.courseCount > 1 ? "s" : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <main id="courses" className="container-custom py-12 md:py-16 space-y-12">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-2xl">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              No published courses yet — check back soon.
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([path, items]) => (
            <section key={path} className="space-y-4">
              <h2 className="text-2xl font-display">
                {sectionTitle[path] ?? path}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((c: any) => {
                  const enr: any = enrollmentByCourse.get(c.id);
                  const progress = Number(enr?.progress_percent ?? 0);
                  const locked = c.is_academy_premium && !hasAccess;
                  return (
                    <Link
                      key={c.id}
                      to={`/learn/${c.slug}`}
                      className="rounded-2xl border border-border bg-surface hover:border-primary/40 transition-all overflow-hidden group relative"
                    >
                      <div className="relative">
                        {c.thumbnail_url ? (
                          <img
                            src={c.thumbnail_url}
                            alt={c.title}
                            className="w-full h-40 object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-40 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                            <BookOpen className="h-10 w-10 text-primary/40" />
                          </div>
                        )}
                        {locked && (
                          <div className="absolute top-2 right-2 rounded-full bg-black/70 text-white text-[10px] px-2 py-1 flex items-center gap-1">
                            <Lock className="h-3 w-3" /> Academy
                          </div>
                        )}
                        {c.instructor_name && (
                          <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full pr-3 pl-1 py-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={c.instructor_avatar_url ?? undefined}
                              />
                              <AvatarFallback className="text-[9px]">
                                {initials(c.instructor_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[11px] text-white font-medium">
                              {c.instructor_name}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Badge
                            className={cn(
                              "text-[10px] border",
                              PATH_STYLE[c.learning_path] ?? "",
                            )}
                          >
                            {c.learning_path}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />{" "}
                            {c.duration_hours ?? 1}h
                          </span>
                        </div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {c.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {c.description}
                        </p>
                        {enr && (
                          <div className="pt-2 space-y-1">
                            <Progress value={progress} className="h-1.5" />
                            <p className="text-[10px] text-muted-foreground">
                              {enr.completed_at
                                ? "Completed"
                                : `${progress}% complete`}
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

      {/* Membership strip */}
      {!hasAccess && (
        <section className="bg-[#0b0c10] text-white">
          <div className="container-custom py-16 text-center space-y-5">
            <h2 className="font-display text-3xl md:text-4xl">
              One membership. Every course.
            </h2>
            <p className="text-white/70 max-w-xl mx-auto">
              Academy all-access unlocks every premium course and every future
              release, taught by named U.Psy clinicians — cancel anytime.
            </p>
            <div className="flex justify-center gap-3 flex-wrap pt-2">
              <Button
                size="lg"
                className="bg-white text-[#0b0c10] hover:bg-white/90"
                onClick={() => startCheckout.mutate("monthly")}
                disabled={startCheckout.isPending}
              >
                Monthly
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:text-white"
                onClick={() => startCheckout.mutate("yearly")}
                disabled={startCheckout.isPending}
              >
                Yearly — best value
              </Button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
