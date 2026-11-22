import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { useLocalizedField } from "@/lib/i18n/localizedField";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft, Award, BookOpen, Loader2 } from "lucide-react";
import { useTrainingsCopy } from "@/lib/academy/trainingsCopy";

/** Published trainings: paths of Academy courses that end with a certificate. */
export default function Trainings() {
  const { t, locale } = useTrainingsCopy();
  const loc = useLocalizedField();
  const { data = [], isLoading } = useQuery({
    queryKey: ["trainings-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trainings")
        .select("*, training_courses(count)")
        .eq("is_published", true)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <>
      <SEOHead
        path="/learn/trainings"
        title={`${t.title} | U.Psy Academy`}
        description={t.subtitle}
      />
      <main className="container-custom py-10 md:py-14 space-y-8">
        <Link
          to={addLocalePrefix("/learn", locale)}
          className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" /> {t.academy}
        </Link>
        <header className="space-y-3 max-w-2xl">
          <h1 className="text-display font-display">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </header>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : data.length === 0 ? (
          <p className="text-muted-foreground">{t.none}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.map((tr) => {
              const n =
                (tr.training_courses as unknown as { count: number }[])?.[0]
                  ?.count ?? 0;
              return (
                <Link
                  key={tr.id}
                  to={addLocalePrefix(`/learn/trainings/${tr.slug}`, locale)}
                  className="rounded-2xl border border-border bg-surface p-5 space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {tr.audience === "professional"
                        ? t.professional
                        : t.public}
                    </Badge>
                    <Badge variant="outline">
                      {t.levels[tr.level] ?? tr.level}
                    </Badge>
                    <Badge variant="secondary">
                      <BookOpen className="me-1 h-3 w-3" /> {t.courses(n)}
                    </Badge>
                    {tr.cpd_hours ? (
                      <Badge variant="secondary">
                        <Award className="me-1 h-3 w-3" />{" "}
                        {t.hours(Number(tr.cpd_hours))}
                      </Badge>
                    ) : null}
                  </div>
                  <h2 className="text-lg font-semibold">{loc(tr, "title")}</h2>
                  {loc(tr, "description") && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {loc(tr, "description")}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
