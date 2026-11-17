import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { useLocalizedField } from "@/lib/i18n/localizedField";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import NotFound from "@/pages/NotFound";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Lock, PlayCircle } from "lucide-react";
import { useSeriesCopy } from "@/lib/live/seriesCopy";
import {
  useAcademyAccess,
  useStartAcademyCheckout,
} from "@/hooks/useAcademyAccess";

interface Item {
  id: string;
  position: number;
  label: string | null;
  label_fr: string | null;
  recording_id: string;
  /** Null when row-level security hides the recording from this viewer. */
  recording: {
    id: string;
    title: string | null;
    title_fr: string | null;
    title_ar: string | null;
    summary: string | null;
    summary_fr: string | null;
    status: string;
  } | null;
}

/** One series: its sessions in order, playable by those allowed to. */
export default function LiveSeriesPlayer() {
  const { id = "" } = useParams<{ id: string }>();
  const { t, locale } = useSeriesCopy();
  const loc = useLocalizedField();
  const { user } = useAuth();
  const { hasAccess } = useAcademyAccess();
  const startCheckout = useStartAcademyCheckout();
  const [playing, setPlaying] = useState<{ id: string; url: string } | null>(
    null,
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["live-series", id, user?.id],
    enabled: !!id,
    queryFn: async () => {
      const { data: s } = await supabase
        .from("live_series")
        .select("*, courses(slug, title, title_fr, title_ar)")
        .eq("id", id)
        .maybeSingle();
      if (!s) return null;
      const { data: items } = await supabase
        .from("live_series_items")
        .select(
          "id, position, label, label_fr, recording_id, recording:live_class_recordings(id, title, title_fr, title_ar, summary, summary_fr, status)",
        )
        .eq("series_id", id)
        .order("position");
      return { s, items: (items ?? []) as unknown as Item[] };
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  if (!data) return <NotFound />;
  const { s, items } = data;
  const course = (
    s as unknown as {
      courses: {
        slug: string;
        title: string;
        title_fr: string | null;
        title_ar: string | null;
      } | null;
    }
  ).courses;
  const canWatch = items.some((i) => i.recording);

  const watch = async (it: Item) => {
    setLoadingId(it.id);
    const { data: res } = await supabase.functions.invoke<{ url?: string }>(
      "live-class",
      { body: { action: "recording_url", recording_id: it.recording_id } },
    );
    setLoadingId(null);
    if (res?.url) setPlaying({ id: it.id, url: res.url });
    else toast.error(t.noReplay);
  };

  const itemTitle = (it: Item) =>
    (locale === "fr" || locale === "ar" ? it.label_fr : null) ||
    it.label ||
    (it.recording ? loc(it.recording, "title") : "") ||
    `${t.session} ${it.position}`;

  return (
    <>
      <SEOHead
        path={`/learn/live/series/${s.id}`}
        title={`${loc(s, "title")} | U.Psy Academy`}
        description={loc(s, "description") || t.subtitle}
      />
      <main className="container-custom py-8 md:py-12 space-y-6">
        <Link
          to={addLocalePrefix("/learn/live/series", locale)}
          className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" /> {t.back}
        </Link>
        <header className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{s.language.toUpperCase()}</Badge>
            {s.category && <Badge variant="outline">{s.category}</Badge>}
            <Badge variant="secondary">{t.sessions(items.length)}</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-display">
            {loc(s, "title")}
          </h1>
          {loc(s, "description") && (
            <p className="text-muted-foreground whitespace-pre-line">
              {loc(s, "description")}
            </p>
          )}
          {course && (
            <p className="text-sm">
              {t.course}:{" "}
              <Link
                to={addLocalePrefix(`/learn/${course.slug}`, locale)}
                className="text-primary underline underline-offset-2"
              >
                {loc(course, "title")}
              </Link>
            </p>
          )}
        </header>

        {playing && (
          <video
            key={playing.id}
            src={playing.url}
            controls
            autoPlay
            className="w-full rounded-2xl bg-black aspect-video"
          />
        )}

        {items.length === 0 ? (
          <p className="text-muted-foreground">{t.empty}</p>
        ) : (
          <>
            {!user ? (
              <Button asChild>
                <Link to={addLocalePrefix("/auth", locale)}>{t.signIn}</Link>
              </Button>
            ) : !canWatch && !hasAccess ? (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-3">
                <p className="font-medium inline-flex items-center gap-2">
                  <Lock className="h-4 w-4" /> {t.locked}
                </p>
                <p className="text-sm text-muted-foreground">{t.lockedBody}</p>
                <Button
                  onClick={() => startCheckout.mutate("monthly")}
                  disabled={startCheckout.isPending}
                >
                  {startCheckout.isPending && (
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  )}
                  {t.join}
                </Button>
              </div>
            ) : null}
            <ol className="space-y-2">
              {items.map((it, i) => {
                const open = !!it.recording && it.recording.status === "stored";
                const active = playing?.id === it.id;
                return (
                  <li
                    key={it.id}
                    className={`rounded-xl border p-4 flex flex-wrap items-center justify-between gap-3 ${
                      active ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {t.session} {i + 1}
                      </p>
                      <p className="font-medium">{itemTitle(it)}</p>
                      {it.recording && loc(it.recording, "summary") && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {loc(it.recording, "summary")}
                        </p>
                      )}
                    </div>
                    {open ? (
                      <Button
                        size="sm"
                        variant={active ? "default" : "outline"}
                        onClick={() => watch(it)}
                        disabled={loadingId === it.id}
                      >
                        {loadingId === it.id ? (
                          <Loader2 className="me-2 h-4 w-4 animate-spin" />
                        ) : (
                          <PlayCircle className="me-2 h-4 w-4" />
                        )}
                        {active ? t.playing : t.watch}
                      </Button>
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </main>
    </>
  );
}
