import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { useLocalizedField } from "@/lib/i18n/localizedField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Circle,
  Download,
  Loader2,
} from "lucide-react";
import { useTrainingsCopy } from "@/lib/academy/trainingsCopy";
import { generateCertificatePdf } from "@/lib/certificatePdf";

type CourseRow = {
  position: number;
  required: boolean;
  courses: {
    id: string;
    slug: string;
    title: string;
    title_fr: string | null;
    title_ar: string | null;
    course_modules: { id: string }[];
  } | null;
};

/** One training: its courses in order, the learner's progress, the certificate. */
export default function TrainingDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { t, locale } = useTrainingsCopy();
  const loc = useLocalizedField();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["training", slug, user?.id],
    enabled: !!slug,
    queryFn: async () => {
      const { data: tr, error } = await supabase
        .from("trainings")
        .select(
          "*, training_courses(position, required, courses(id, slug, title, title_fr, title_ar, course_modules(id)))",
        )
        .eq("slug", slug!)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      if (!tr) return null;
      const rows = (tr.training_courses as unknown as CourseRow[])
        .filter((r) => r.courses)
        .sort((a, b) => a.position - b.position);
      let done = new Set<string>();
      let cert = null;
      if (user) {
        const ids = rows.map((r) => r.courses!.id);
        const [{ data: enr }, { data: c }] = await Promise.all([
          supabase
            .from("course_enrollments")
            .select("course_id, completed_modules")
            .eq("user_id", user.id)
            .in("course_id", ids),
          supabase
            .from("certificates")
            .select("*")
            .eq("user_id", user.id)
            .eq("certificate_type", "mooc_training")
            .eq("reference_id", tr.id)
            .maybeSingle(),
        ]);
        done = new Set(
          rows
            .filter((r) => {
              const e = enr?.find((x) => x.course_id === r.courses!.id);
              const got = new Set(e?.completed_modules ?? []);
              const mods = r.courses!.course_modules;
              return mods.length > 0 && mods.every((m) => got.has(m.id));
            })
            .map((r) => r.courses!.id),
        );
        cert = c;
      }
      return { tr, rows, done, cert };
    },
  });

  const issue = useMutation({
    mutationFn: async (trainingId: string) => {
      const { data: id, error } = await supabase.rpc(
        "issue_training_certificate",
        { _training: trainingId },
      );
      if (error) throw error;
      const { data: c, error: e2 } = await supabase
        .from("certificates")
        .select("*")
        .eq("id", id)
        .single();
      if (e2) throw e2;
      return c;
    },
    onSuccess: async (c) => {
      await generateCertificatePdf({
        ...c,
        metadata: (c.metadata ?? null) as Record<string, unknown> | null,
      });
      qc.invalidateQueries({ queryKey: ["training", slug] });
    },
    onError: () => toast.error(t.certError),
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  if (!data) return <Navigate to="/learn/trainings" replace />;

  const { tr, rows, done, cert } = data;
  const required = rows.filter((r) => r.required);
  const doneRequired = required.filter((r) => done.has(r.courses!.id)).length;
  const complete = required.length > 0 && doneRequired === required.length;

  return (
    <>
      <SEOHead
        path={`/learn/trainings/${tr.slug}`}
        title={`${loc(tr, "title")} | U.Psy Academy`}
        description={loc(tr, "description") || undefined}
      />
      <main className="container-custom py-10 md:py-14 space-y-8 max-w-3xl">
        <Link
          to={addLocalePrefix("/learn/trainings", locale)}
          className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" /> {t.back}
        </Link>
        <header className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {tr.audience === "professional" ? t.professional : t.public}
            </Badge>
            <Badge variant="outline">{t.levels[tr.level] ?? tr.level}</Badge>
            {tr.cpd_hours ? (
              <Badge variant="secondary">
                <Award className="me-1 h-3 w-3" />
                {t.hours(Number(tr.cpd_hours))}
              </Badge>
            ) : null}
          </div>
          <h1 className="text-display font-display">{loc(tr, "title")}</h1>
          {loc(tr, "description") && (
            <p className="text-muted-foreground">{loc(tr, "description")}</p>
          )}
        </header>

        {user ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t.progress(doneRequired, required.length)}
            </p>
            <Progress
              value={
                required.length ? (doneRequired / required.length) * 100 : 0
              }
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t.signIn}</p>
        )}

        <ol className="space-y-3">
          {rows.map((r, i) => {
            const c = r.courses!;
            const isDone = done.has(c.id);
            return (
              <li
                key={c.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4"
              >
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-u-turquoise" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {i + 1}
                    {!r.required && ` · ${t.optional}`}
                  </p>
                  <p className="font-medium truncate">{loc(c, "title")}</p>
                </div>
                <Link to={addLocalePrefix(`/learn/${c.slug}`, locale)}>
                  <Button size="sm" variant={isDone ? "ghost" : "outline"}>
                    {isDone ? t.done : t.start}
                  </Button>
                </Link>
              </li>
            );
          })}
        </ol>

        {user && (
          <section className="rounded-2xl border border-border bg-surface p-6 space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" /> {t.certTitle}
            </h2>
            {cert ? (
              <Button
                onClick={() =>
                  generateCertificatePdf({
                    ...cert,
                    metadata: (cert.metadata ?? null) as Record<
                      string,
                      unknown
                    > | null,
                  })
                }
              >
                <Download className="h-4 w-4 me-2" /> {t.download}
              </Button>
            ) : complete ? (
              <>
                <p className="text-sm text-muted-foreground">{t.certReady}</p>
                <Button
                  onClick={() => issue.mutate(tr.id)}
                  disabled={issue.isPending}
                >
                  {issue.isPending && (
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  )}
                  {t.getCert}
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t.certLocked}</p>
            )}
          </section>
        )}
      </main>
    </>
  );
}
