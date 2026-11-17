import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { useLocalizedField } from "@/lib/i18n/localizedField";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft, ListVideo, Loader2 } from "lucide-react";
import { useSeriesCopy } from "@/lib/live/seriesCopy";

/** Published series of live-class recordings. */
export default function LiveSeries() {
  const { t, locale } = useSeriesCopy();
  const loc = useLocalizedField();
  const { data = [], isLoading } = useQuery({
    queryKey: ["live-series-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_series")
        .select("*, live_series_items(count)")
        .eq("is_published", true)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <>
      <SEOHead
        path="/learn/live/series"
        title={`${t.title} | U.Psy Academy`}
        description={t.subtitle}
      />
      <main className="container-custom py-10 md:py-14 space-y-8">
        <Link
          to={addLocalePrefix("/learn/live", locale)}
          className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" /> {t.backLive}
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
            {data.map((s) => {
              const n =
                (s.live_series_items as unknown as { count: number }[])?.[0]
                  ?.count ?? 0;
              return (
                <Link
                  key={s.id}
                  to={addLocalePrefix(`/learn/live/series/${s.id}`, locale)}
                  className="rounded-2xl border border-border bg-surface p-5 space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{s.language.toUpperCase()}</Badge>
                    {s.category && (
                      <Badge variant="outline">{s.category}</Badge>
                    )}
                    <Badge variant="secondary">
                      <ListVideo className="me-1 h-3 w-3" /> {t.sessions(n)}
                    </Badge>
                  </div>
                  <h2 className="text-lg font-semibold">{loc(s, "title")}</h2>
                  {loc(s, "description") && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {loc(s, "description")}
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
