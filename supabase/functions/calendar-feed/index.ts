// A user's sessions as an iCalendar feed, for Google, Outlook or Apple
// Calendar to subscribe to: GET /calendar-feed?token=<secret>. Calendar apps
// cannot send a login, so the secret token in calendar_feeds is the
// credential (verify_jwt = false). Titles stay generic ("UPSY session") so
// a leaked feed does not name clients; the link inside needs a login.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { icsCalendar, type IcsEvent } from "../_shared/ics.ts";

const ORIGIN = Deno.env.get("PUBLIC_SITE_URL") ?? "https://upsy.ma";

Deno.serve(async (req) => {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (!/^[0-9a-f]{64}$/.test(token))
    return new Response("Not found", { status: 404 });

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: feed } = await sb
    .from("calendar_feeds")
    .select("user_id")
    .eq("token", token)
    .maybeSingle();
  if (!feed) return new Response("Not found", { status: 404 });

  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const { data: rows, error } = await sb
    .from("bookings")
    .select(
      "id, psychologist_id, status, session_type, scheduled_at, duration_minutes",
    )
    .or(`patient_id.eq.${feed.user_id},psychologist_id.eq.${feed.user_id}`)
    .in("status", ["pending", "confirmed", "completed", "cancelled"])
    .gte("scheduled_at", since)
    .order("scheduled_at")
    .limit(500);
  if (error) return new Response("Unavailable", { status: 503 });

  // Webinars the person registered for (seat confirmed) or speaks at.
  const { data: regs } = await sb
    .from("live_class_registrations")
    .select(
      "role, payment_status, live_classes(id, title, title_fr, starts_at, duration_minutes, status)",
    )
    .eq("user_id", feed.user_id)
    .is("cancelled_at", null)
    .in("payment_status", ["none", "verified"])
    .limit(200);
  type Live = {
    id: string;
    title: string;
    title_fr: string | null;
    starts_at: string;
    duration_minutes: number;
    status: string;
  };
  const webinars = (regs ?? [])
    .map((r) => r.live_classes as unknown as Live | null)
    .filter((c): c is Live => !!c && c.starts_at >= since)
    .map((c): IcsEvent => {
      const url = `${ORIGIN}/learn/live/${c.id}`;
      return {
        uid: `live-${c.id}`,
        start: new Date(c.starts_at),
        durationMin: c.duration_minutes,
        summary: `Webinaire : ${c.title_fr || c.title}`,
        description: `En ligne. Rejoindre : ${url}`,
        url,
        location: url,
        status: c.status === "cancelled" ? "CANCELLED" : "CONFIRMED",
      };
    });

  const ics = icsCalendar(
    (rows ?? [])
      .map((b): IcsEvent => {
        const online = b.session_type !== "in_person";
        const url = `${ORIGIN}/session/${b.id}`;
        const role =
          b.psychologist_id === feed.user_id ? "specialist" : "client";
        return {
          uid: b.id,
          start: new Date(b.scheduled_at),
          durationMin: b.duration_minutes ?? 50,
          summary: `${b.status === "pending" ? "Requested: " : ""}UPSY session`,
          description: `${online ? `Online. Join: ${url}` : "In person."}\nDetails: ${ORIGIN}/dashboard/${role}`,
          url: online ? url : undefined,
          location: online ? url : "In person",
          status:
            b.status === "pending"
              ? "TENTATIVE"
              : b.status === "cancelled"
                ? "CANCELLED"
                : "CONFIRMED",
        };
      })
      .concat(webinars),
    "PUBLISH",
    "UPSY sessions",
  );
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "private, max-age=300",
    },
  });
});
