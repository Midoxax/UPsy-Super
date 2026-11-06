// Emails the other party when a booking changes, once per booking and status:
//   pending   → the specialist: a new request to confirm or decline
//   confirmed → the client (with a calendar invite) and the specialist (invite)
//   cancelled → whoever did not cancel
// Called by the app right after it writes the booking. Only the client or
// specialist on the booking may call it, and the booking's current status
// decides the email, so a caller cannot choose what is sent.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sender } from "../_shared/sender.ts";
import { icsCalendar } from "../_shared/ics.ts";
import { SITE_URL } from "../_shared/site.ts";
import {
  bookingEmail,
  type BookingMailKind,
} from "../_shared/email/booking.ts";
import { normaliseLocale } from "../_shared/email/layout.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ORIGIN = SITE_URL;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { booking_id } = await req.json();
    if (!booking_id || typeof booking_id !== "string")
      return json({ error: "Missing booking_id" }, 400);

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: b } = await sb
      .from("bookings")
      .select(
        "id, patient_id, psychologist_id, patient_email, status, session_type, scheduled_at, duration_minutes, decline_reason, payment_status",
      )
      .eq("id", booking_id)
      .maybeSingle();
    if (!b) return json({ error: "Not found" }, 404);
    if (user.id !== b.patient_id && user.id !== b.psychologist_id)
      return json({ error: "Forbidden" }, 403);
    if (!["pending", "confirmed", "cancelled"].includes(b.status))
      return json({ ok: true, sent: 0 });

    // Once per booking and status. The row is written only after a send
    // succeeds, so a failed send can be retried by calling again.
    const { data: already } = await sb
      .from("booking_emails")
      .select("booking_id")
      .eq("booking_id", b.id)
      .eq("status", b.status)
      .maybeSingle();
    if (already) return json({ ok: true, sent: 0, duplicate: true });

    const [{ data: psy }, { data: client }, psyAuth, clientAuth] =
      await Promise.all([
        sb
          .from("psychologist_profiles")
          .select("full_name, city")
          .eq("id", b.psychologist_id)
          .maybeSingle(),
        sb
          .from("profiles")
          .select("full_name")
          .eq("id", b.patient_id)
          .maybeSingle(),
        sb.auth.admin.getUserById(b.psychologist_id),
        b.patient_id
          ? sb.auth.admin.getUserById(b.patient_id)
          : Promise.resolve(null),
      ]);
    const psyName = psy?.full_name ?? "U.Psy";
    const clientName = client?.full_name ?? "Client";
    const psyEmail = psyAuth.data.user?.email;
    const clientEmail = clientAuth?.data.user?.email ?? b.patient_email;
    // Each person reads the email in the language they signed up in.
    const psyLocale = normaliseLocale(psyAuth.data.user?.user_metadata?.locale);
    const clientLocale = normaliseLocale(
      clientAuth?.data.user?.user_metadata?.locale,
    );

    const start = new Date(b.scheduled_at);
    const online = b.session_type !== "in_person";
    const joinUrl = `${ORIGIN}/session/${b.id}`;
    const paid = b.payment_status === "paid" || b.payment_status === "comp";
    const where = online
      ? `Online: ${joinUrl}`
      : `In person${psy?.city ? `, ${psy.city}` : ""}`;
    const invite = (summary: string) =>
      icsCalendar([
        {
          uid: b.id,
          start,
          durationMin: b.duration_minutes ?? 50,
          summary,
          description: where,
          url: online ? joinUrl : undefined,
        },
      ]);
    const ctx = {
      start,
      durationMin: b.duration_minutes ?? 50,
      online,
      city: psy?.city,
      specialistName: psyName,
      clientName,
      paid,
      reason: b.decline_reason,
      joinUrl,
    };
    const compose = (
      kind: BookingMailKind,
      to: string | null | undefined,
      locale: ReturnType<typeof normaliseLocale>,
      ctaUrl: string,
      ics?: string,
    ) => ({ to, ics, ...bookingEmail(kind, locale, { ...ctx, ctaUrl }) });

    const mails: Array<{
      to?: string | null;
      subject: string;
      html: string;
      text: string;
      ics?: string;
    }> = [];
    if (b.status === "pending") {
      mails.push(
        compose(
          "request_to_specialist",
          psyEmail,
          psyLocale,
          `${ORIGIN}/dashboard/specialist`,
        ),
      );
    } else if (b.status === "confirmed") {
      // Paying ahead (transfer, CashPlus, Wafacash) secures the slot and is
      // what the button leads to; paying at the session stays allowed.
      mails.push(
        compose(
          "confirmed_to_client",
          clientEmail,
          clientLocale,
          paid
            ? online
              ? joinUrl
              : `${ORIGIN}/dashboard/client`
            : `${ORIGIN}/dashboard/client?tab=billing&pay=${b.id}`,
          invite(`Session · ${psyName} · U.Psy`),
        ),
        compose(
          "confirmed_to_specialist",
          psyEmail,
          psyLocale,
          `${ORIGIN}/dashboard/specialist`,
          invite(`U.Psy · ${clientName}`),
        ),
      );
    } else {
      const byClient = user.id === b.patient_id;
      mails.push(
        byClient
          ? compose(
              "cancelled_to_specialist",
              psyEmail,
              psyLocale,
              `${ORIGIN}/dashboard/specialist`,
            )
          : compose(
              "cancelled_to_client",
              clientEmail,
              clientLocale,
              `${ORIGIN}/psychologists`,
            ),
      );
    }

    const key = Deno.env.get("RESEND_API_KEY");
    let sent = 0;
    for (const m of mails) {
      if (!key || !m.to) continue;
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: sender(),
          to: [m.to],
          subject: m.subject,
          html: m.html,
          text: m.text,
          ...(m.ics
            ? {
                attachments: [
                  {
                    filename: "session.ics",
                    content: btoa(unescape(encodeURIComponent(m.ics))),
                  },
                ],
              }
            : {}),
        }),
      });
      if (resp.ok) sent++;
      else console.warn("[booking-email] send failed", await resp.text());
    }
    if (sent > 0) {
      // A concurrent call may have recorded it first; that conflict is fine.
      const { error: logErr } = await sb
        .from("booking_emails")
        .insert({ booking_id: b.id, status: b.status });
      if (logErr) console.warn("[booking-email] dedupe row", logErr.message);
    }
    return json({ ok: true, sent });
  } catch (e) {
    console.error("booking-email", e);
    return json({ error: "Could not send the email" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
