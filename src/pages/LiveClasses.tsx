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
import { Input } from "@/components/ui/input";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";
import {
  CalendarPlus,
  CalendarClock,
  Clock,
  ListVideo,
  Loader2,
  Settings,
  Video,
} from "lucide-react";
import { formatWhen, registerError, useLiveCopy } from "@/lib/live/liveCopy";
import type { Tables } from "@/integrations/supabase/types";
import { useCanHost } from "@/lib/live/useCanHost";

type LiveClass = Tables<"live_classes">;

/** Academy live classes: upcoming list, registration with consent. */
export default function LiveClasses() {
  const { t, locale } = useLiveCopy();
  const { data: canHost } = useCanHost();

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
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={addLocalePrefix("/learn/live/series", locale)}>
                <ListVideo className="me-2 h-4 w-4" /> {t.replays}
              </Link>
            </Button>
            {canHost && (
              <Button asChild variant="outline" size="sm">
                <Link to={addLocalePrefix("/learn/live/manage", locale)}>
                  <Settings className="me-2 h-4 w-4" /> {t.manage}
                </Link>
              </Button>
            )}
          </div>
        </header>
        <LiveClassSections />
      </main>
    </>
  );
}

/**
 * Upcoming classes with registration, then the past ones the viewer
 * attended or may replay. `organizer` keeps one organiser's classes
 * (the League's training center passes "lsspm").
 */
export function LiveClassSections({ organizer }: { organizer?: string }) {
  const { t } = useLiveCopy();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["live-classes", user?.id, organizer ?? "all"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
      let q = supabase
        .from("live_classes")
        .select("*")
        .eq("is_published", true)
        .neq("status", "cancelled")
        .gte("starts_at", since)
        .order("starts_at");
      if (organizer) q = q.eq("organizer", organizer);
      const { data: classes, error } = await q;
      if (error) throw error;
      // Replays the viewer may watch (row-level security decides): their own
      // classes, and the League's replays for League members, at any date.
      const { data: recs } = user
        ? await supabase
            .from("live_class_recordings")
            .select("class_id")
            .eq("is_published", true)
            .eq("status", "stored")
        : { data: [] };
      const replayIds = [...new Set((recs ?? []).map((r) => r.class_id))];
      const known = new Set((classes ?? []).map((c) => c.id));
      const older = replayIds.filter((id) => !known.has(id));
      const extra = older.length
        ? ((
            await supabase
              .from("live_classes")
              .select("*")
              .in("id", older)
              .order("starts_at")
          ).data ?? [])
        : [];
      const list = [
        ...extra.filter((c) => !organizer || c.organizer === organizer),
        ...(classes ?? []),
      ];
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
              .select("class_id, payment_status")
              .eq("user_id", user.id)
              .is("cancelled_at", null)
          ).data ?? [])
        : [];
      return {
        classes: list,
        seats: Object.fromEntries(seats) as Record<string, number>,
        // Confirmed seats; a paid seat counts once the transfer is confirmed.
        mine: new Set(
          mine
            .filter((r) => ["none", "verified"].includes(r.payment_status))
            .map((r) => r.class_id),
        ),
        replays: new Set(replayIds),
        awaitingPayment: new Set(
          mine
            .filter((r) => !["none", "verified"].includes(r.payment_status))
            .map((r) => r.class_id),
        ),
      };
    },
  });

  const now = Date.now();
  const ends = (c: LiveClass) =>
    new Date(c.starts_at).getTime() + c.duration_minutes * 60000;
  const upcoming = (data?.classes ?? []).filter((c) => ends(c) >= now);
  const past = (data?.classes ?? [])
    .filter(
      (c) => ends(c) < now && (data?.mine.has(c.id) || data?.replays.has(c.id)),
    )
    .reverse();

  return (
    <>
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
                awaitingPayment={data!.awaitingPayment.has(c.id)}
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
    </>
  );
}

function ClassCard({
  c,
  taken,
  registered,
  awaitingPayment = false,
  past = false,
}: {
  c: LiveClass;
  taken: number;
  registered: boolean;
  awaitingPayment?: boolean;
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
    if (data === "payment_required")
      return qc.invalidateQueries({ queryKey: ["live-classes"] });
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
        {c.organizer === "lsspm" && (
          <Badge className="bg-[#2E5B8C] text-white">{t.leagueBadge}</Badge>
        )}
        {c.access === "members" && (
          <Badge variant="secondary">{t.membersOnly}</Badge>
        )}
        {c.access === "paid" && (
          <Badge variant="secondary">
            {Number(c.price_mad)} MAD
            {Number(c.member_price_mad) === 0 && c.organizer
              ? ` · ${t.memberFree}`
              : ""}
          </Badge>
        )}
        {c.training_hours != null && (
          <Badge variant="outline">
            {c.training_hours} {t.hoursLabel}
          </Badge>
        )}
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
      {c.speaker_name && (
        <p className="text-sm">
          {t.speakerBy} <span className="font-medium">{c.speaker_name}</span>
          {c.speaker_title ? `, ${c.speaker_title}` : ""}
        </p>
      )}
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
      ) : awaitingPayment ? (
        <PaymentBox classId={c.id} />
      ) : registered ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm">
            <Link to={href}>
              <Video className="me-2 h-4 w-4" /> {t.join}
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadIcs(c, loc(c, "title"))}
          >
            <CalendarPlus className="me-2 h-4 w-4" /> {t.addCalendar}
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

/** A calendar file for one class, made in the browser. */
function downloadIcs(c: LiveClass, title: string) {
  const stamp = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const start = new Date(c.starts_at);
  const end = new Date(start.getTime() + c.duration_minutes * 60000);
  const url = `https://upsy.ma/learn/live/${c.id}`;
  const esc = (v: string) => v.replace(/[\\;,]/g, (m) => "\\" + m);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//U.Psy//Live//FR",
    "BEGIN:VEVENT",
    `UID:live-${c.id}@upsy.ma`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(url)}`,
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = "webinar.ics";
  a.click();
  URL.revokeObjectURL(a.href);
}

/** A paid seat: the account to pay, the reference, and where to say it is paid. */
function PaymentBox({ classId }: { classId: string }) {
  const { t } = useLiveCopy();
  const qc = useQueryClient();
  const [ref, setRef] = useState("");
  const [busy, setBusy] = useState(false);
  const { data: info } = useQuery({
    queryKey: ["webinar-payment", classId],
    queryFn: async () =>
      ((await supabase.rpc("webinar_payment_info", { _class: classId })).data ??
        null) as Record<string, string | number | null> | null,
  });
  if (!info) return <Loader2 className="h-4 w-4 animate-spin" />;
  const submit = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("submit_webinar_payment", {
      _class: classId,
      _reference: ref,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t.paySent);
    qc.invalidateQueries({ queryKey: ["webinar-payment", classId] });
  };
  const rows: [string, unknown][] = [
    [t.payAmount, `${Number(info.amount_mad)} MAD`],
    [t.payHolder, info.account_holder],
    [t.payBank, info.bank_name],
    [t.payRib, info.rib],
    [t.payRef, info.reference],
  ];
  return (
    <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
      <p className="font-semibold">{t.payTitle}</p>
      {info.payment_status === "submitted" ? (
        <p>{t.paySent}</p>
      ) : (
        <>
          {info.payment_status === "rejected" && (
            <p className="text-destructive">{t.payRejected}</p>
          )}
          <p className="text-muted-foreground">{t.payText}</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            {rows
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium break-all">{String(v)}</dd>
                </div>
              ))}
          </dl>
          <div className="flex gap-2">
            <Input
              id={`pay-ref-${classId}`}
              aria-label={t.payYourRef}
              placeholder={t.payYourRef}
              value={ref}
              onChange={(e) => setRef(e.target.value)}
            />
            <Button
              size="sm"
              onClick={submit}
              disabled={busy || ref.trim().length < 3}
            >
              {t.paySend}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
