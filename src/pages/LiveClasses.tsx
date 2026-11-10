import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import { useLocalizedField } from "@/lib/i18n/localizedField";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";
import { CalendarClock, Clock, Loader2, Settings, Video } from "lucide-react";
import { formatWhen, registerError, useLiveCopy } from "@/lib/live/liveCopy";
import type { Tables } from "@/integrations/supabase/types";
import { useCanHost } from "@/lib/live/useCanHost";

type LiveClass = Tables<"live_classes">;

/** Academy live classes: upcoming list, registration with consent. */
export default function LiveClasses() {
  const { t, locale } = useLiveCopy();
  const { user } = useAuth();
  const { data: canHost } = useCanHost();

  const { data, isLoading } = useQuery({
    queryKey: ["live-classes", user?.id],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
      const { data: classes, error } = await supabase
        .from("live_classes")
        .select("*")
        .eq("is_published", true)
        .neq("status", "cancelled")
        .gte("starts_at", since)
        .order("starts_at");
      if (error) throw error;
      const list = classes ?? [];
      const seats = await Promise.all(
        list.map((c) =>
          supabase
            .rpc("live_class_seats", { _class: c.id })
            .then((r) => [c.id, r.data ?? 0] as const),
        ),
      );
      const mine = user
        ? ((
            await supabase
              .from("live_class_registrations")
              .select("class_id")
              .eq("user_id", user.id)
              .is("cancelled_at", null)
          ).data ?? [])
        : [];
      return {
        classes: list,
        seats: Object.fromEntries(seats) as Record<string, number>,
        mine: new Set(mine.map((r) => r.class_id)),
      };
    },
  });

  const now = Date.now();
  const ends = (c: LiveClass) =>
    new Date(c.starts_at).getTime() + c.duration_minutes * 60000;
  const upcoming = (data?.classes ?? []).filter((c) => ends(c) >= now);
  const past = (data?.classes ?? [])
    .filter((c) => ends(c) < now && data?.mine.has(c.id))
    .reverse();

  return (
    <>
      <SEOHead
        path="/learn/live"
        title={`${t.title} | U.Psy Academy`}
        description={t.subtitle}
      />
      <main className="container-custom py-10 md:py-14 space-y-10">
        <header className="space-y-3 max-w-2xl">
          <h1 className="text-display font-display">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
          {canHost && (
            <Button asChild variant="outline" size="sm">
              <Link to={addLocalePrefix("/learn/live/manage", locale)}>
                <Settings className="me-2 h-4 w-4" /> {t.manage}
              </Link>
            </Button>
          )}
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t.upcoming}</h2>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : upcoming.length === 0 ? (
            <p className="text-muted-foreground">{t.none}</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcoming.map((c) => (
                <ClassCard
                  key={c.id}
                  c={c}
                  taken={data!.seats[c.id] ?? 0}
                  registered={data!.mine.has(c.id)}
                />
              ))}
            </div>
          )}
        </section>

        {past.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">{t.past}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {past.map((c) => (
                <ClassCard key={c.id} c={c} taken={0} registered past />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

function ClassCard({
  c,
  taken,
  registered,
  past = false,
}: {
  c: LiveClass;
  taken: number;
  registered: boolean;
  past?: boolean;
}) {
  const { t, locale } = useLiveCopy();
  const loc = useLocalizedField();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const left = c.capacity == null ? null : Math.max(0, c.capacity - taken);
  const href = addLocalePrefix(`/learn/live/${c.id}`, locale);

  const register = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("register_live_class", {
      _class: c.id,
      _recording_consent: consent,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (data !== "registered") return toast.error(registerError(data, t));
    toast.success(t.registered);
    qc.invalidateQueries({ queryKey: ["live-classes"] });
  };
  const cancel = async () => {
    setBusy(true);
    await supabase.rpc("cancel_live_registration", { _class: c.id });
    setBusy(false);
    qc.invalidateQueries({ queryKey: ["live-classes"] });
  };

  return (
    <article className="rounded-2xl border border-border bg-surface p-5 space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">
          {c.recording_enabled ? t.recorded : t.notRecorded}
        </Badge>
        <Badge variant="outline">{c.language.toUpperCase()}</Badge>
        {!past && left !== null && (
          <Badge variant={left === 0 ? "destructive" : "secondary"}>
            {left === 0 ? t.full : t.seatsLeft(left)}
          </Badge>
        )}
      </div>
      <h3 className="text-lg font-semibold">
        <Link to={href} className="hover:text-primary">
          {loc(c, "title")}
        </Link>
      </h3>
      <p className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
        <span className="inline-flex items-center gap-1">
          <CalendarClock className="h-4 w-4" />{" "}
          {formatWhen(c.starts_at, locale)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-4 w-4" /> {c.duration_minutes} {t.minutes}
        </span>
      </p>
      {loc(c, "description") && (
        <p className="text-sm text-muted-foreground line-clamp-3">
          {loc(c, "description")}
        </p>
      )}

      {past ? (
        <Button asChild size="sm" variant="outline">
          <Link to={href}>
            <Video className="me-2 h-4 w-4" /> {t.replays}
          </Link>
        </Button>
      ) : !user ? (
        <Button asChild size="sm">
          <Link to={addLocalePrefix("/auth", locale)}>{t.signIn}</Link>
        </Button>
      ) : registered ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm">
            <Link to={href}>
              <Video className="me-2 h-4 w-4" /> {t.join}
            </Link>
          </Button>
          <Button size="sm" variant="ghost" onClick={cancel} disabled={busy}>
            {t.cancel}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {c.recording_enabled && (
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <Checkbox
                checked={consent}
                onCheckedChange={(v) => setConsent(v === true)}
                className="mt-0.5"
              />
              <span>{t.consent}</span>
            </label>
          )}
          <Button
            size="sm"
            onClick={register}
            disabled={busy || left === 0 || (c.recording_enabled && !consent)}
          >
            {busy && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {t.register}
          </Button>
        </div>
      )}
    </article>
  );
}
