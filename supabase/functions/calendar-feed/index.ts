// A user's sessions as an iCalendar feed, for Google, Outlook or Apple
// Calendar to subscribe to: GET /calendar-feed?token=<secret>. Calendar apps
// cannot send a login, so the secret token in calendar_feeds is the
// credential (verify_jwt = false). Titles stay generic ("UPSY session") so
// a leaked feed does not name clients; the link inside needs a login.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { icsCalendar } from "../_shared/ics.ts";

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

  const ics = icsCalendar(
    (rows ?? []).map((b) => {
      const online = b.session_type !== "in_person";
      const url = `${ORIGIN}/session/${b.id}`;
      const role = b.psychologist_id === feed.user_id ? "specialist" : "client";
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
    }),
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
