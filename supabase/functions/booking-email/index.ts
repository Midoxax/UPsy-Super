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
        "id, patient_id, psychologist_id, patient_email, status, session_type, scheduled_at, duration_minutes, decline_reason",
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
    const psyName = psy?.full_name ?? "your specialist";
    const clientName = client?.full_name ?? "A client";
    const psyEmail = psyAuth.data.user?.email;
    const clientEmail = clientAuth?.data.user?.email ?? b.patient_email;

    const start = new Date(b.scheduled_at);
    const when = start.toLocaleString("en-GB", {
      timeZone: "Africa/Casablanca",
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
    const online = b.session_type !== "in_person";
    const joinUrl = `${ORIGIN}/session/${b.id}`;
    const where = online
      ? `Online. Join from ${joinUrl} (opens 10 minutes before).`
      : `In person${psy?.city ? `, ${psy.city}` : ""}. Your specialist will confirm the address.`;
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

    const mails: Array<{
      to?: string | null;
      subject: string;
      body: string;
      cta: string;
      ics?: string;
    }> = [];
    if (b.status === "pending") {
      mails.push({
        to: psyEmail,
        subject: "New session request",
        body: `${clientName} asked for a ${b.duration_minutes}-minute ${online ? "online" : "in-person"} session on ${when} (Morocco time). Confirm or decline it in your dashboard.`,
        cta: `${ORIGIN}/dashboard/specialist`,
      });
    } else if (b.status === "confirmed") {
      mails.push(
        {
          to: clientEmail,
          subject: `Session confirmed with ${psyName}`,
          body: `Your session with ${psyName} on ${when} (Morocco time) is confirmed.\n\n${where}\n\nYou pay your specialist at the session. The calendar invite is attached.`,
          cta: online ? joinUrl : `${ORIGIN}/dashboard/client`,
          ics: invite(`Session with ${psyName} — U.Psy`),
        },
        {
          to: psyEmail,
          subject: "Session confirmed",
          body: `Your session with ${clientName} on ${when} (Morocco time) is confirmed. The calendar invite is attached.`,
          cta: `${ORIGIN}/dashboard/specialist`,
          ics: invite("U.Psy session"),
        },
      );
    } else {
      const byClient = user.id === b.patient_id;
      mails.push({
        to: byClient ? psyEmail : clientEmail,
        subject: "Session cancelled",
        body: `The session on ${when} (Morocco time) was cancelled${byClient ? ` by ${clientName}` : ` by ${psyName}`}.${b.decline_reason ? `\n\nReason: ${b.decline_reason}` : ""}`,
        cta: byClient
          ? `${ORIGIN}/dashboard/specialist`
          : `${ORIGIN}/psychologists`,
      });
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
          html: html(m.subject, m.body, m.cta),
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

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function html(title: string, body: string, cta: string) {
  return `<!doctype html>
<html><body style="margin:0;padding:32px;background:#F7F3F0;font-family:Inter,Arial,sans-serif;color:#2a1a1d">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:20px;padding:32px;border:1px solid #e9dfd8">
    <div style="margin-bottom:12px"><img src="https://www.upsy.ma/brand/upsy-wordmark.png" alt="U.Psy" width="140" style="display:block;height:auto;border:0" /></div>
    <h1 style="font-size:22px;margin:0 0 12px">${esc(title)}</h1>
    <p style="font-size:15px;line-height:1.6;color:#5a4a4d;white-space:pre-wrap">${esc(body)}</p>
    <a href="${esc(cta)}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#6B1F2A;color:#fff;text-decoration:none;border-radius:12px;font-weight:600">Open U.Psy</a>
    <hr style="border:none;border-top:1px solid #f0e6df;margin:32px 0 16px" />
    <p style="font-size:12px;color:#a09590;margin:0">U.Psy · +212 668-594699 · upsy.ma</p>
  </div>
</body></html>`;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
