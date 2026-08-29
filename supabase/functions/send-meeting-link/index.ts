// Edge function: psychologist sends a confirmed video meeting invitation
// to a client. Creates a booking with status='confirmed' (auto-generates
// video_room_id via trigger) and emails the client a single "Join session" link.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sender } from "../_shared/sender.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Body {
  client_email: string;
  client_name?: string;
  client_phone?: string;
  scheduled_at: string;
  duration_minutes: number;
  notes?: string;
}

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

// Build an .ics calendar invite (RFC 5545) the recipient can add to Google/Apple Calendar.
function buildIcs(opts: {
  uid: string;
  start: Date;
  durationMin: number;
  summary: string;
  description: string;
  url: string;
}) {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = new Date(opts.start.getTime() + opts.durationMin * 60 * 1000);
  const escape = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//U.Psy//Session//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${opts.uid}@upsy.ma`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(opts.start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${escape(opts.summary)}`,
    `DESCRIPTION:${escape(opts.description)}`,
    `URL:${opts.url}`,
    `LOCATION:${escape(opts.url)}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder",
    "TRIGGER:-PT15M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const psychologistId = userData.user.id;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", psychologistId)
      .eq("role", "psychologist")
      .maybeSingle();
    if (!roleRow) {
      return new Response(
        JSON.stringify({ error: "Only psychologists can send meeting links" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as Body;
    if (!body.client_email || !isValidEmail(body.client_email)) {
      return new Response(
        JSON.stringify({ error: "Invalid client email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!body.scheduled_at || isNaN(new Date(body.scheduled_at).getTime())) {
      return new Response(
        JSON.stringify({ error: "Invalid scheduled date" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    // Allow "now-ish" — must be at least 5 minutes in the past tolerance
    const startMs = new Date(body.scheduled_at).getTime();
    if (startMs < Date.now() - 5 * 60 * 1000) {
      return new Response(
        JSON.stringify({ error: "Scheduled time is in the past" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (![30, 45, 50, 60, 90].includes(body.duration_minutes)) {
      return new Response(
        JSON.stringify({ error: "Invalid duration" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Conflict check (no availability/1h-future enforcement; this is the "instant" path)
    const endMs = startMs + body.duration_minutes * 60 * 1000;
    const { data: existing } = await admin
      .from("bookings")
      .select("id, scheduled_at, duration_minutes, status")
      .eq("psychologist_id", psychologistId)
      .in("status", ["proposed", "pending", "confirmed"])
      .gte("scheduled_at", new Date(startMs - 4 * 60 * 60 * 1000).toISOString())
      .lte("scheduled_at", new Date(endMs + 1000).toISOString());
    const conflict = (existing ?? []).some((b) => {
      const bs = new Date(b.scheduled_at).getTime();
      const be = bs + (b.duration_minutes ?? 50) * 60 * 1000;
      return bs < endMs && be > startMs;
    });
    if (conflict) {
      return new Response(
        JSON.stringify({
          error: "You already have a booking that overlaps with this time.",
          reason: "slot_conflict",
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const email = body.client_email.trim().toLowerCase();
    // NOTE: auth.admin.listUsers() crashes with NULL confirmation_token rows
    // ("converting NULL to string is unsupported") — query the table directly.
    const { data: existingRows } = await admin
      .schema("auth")
      .from("users")
      .select("id,email")
      .ilike("email", email)
      .limit(1);
    const existingUser = existingRows?.[0] as { id: string; email: string } | undefined;

    const { data: booking, error: insertErr } = await admin
      .from("bookings")
      .insert({
        psychologist_id: psychologistId,
        patient_id: existingUser?.id ?? psychologistId,
        patient_email: email,
        scheduled_at: new Date(startMs).toISOString(),
        duration_minutes: body.duration_minutes,
        session_type: "video",
        status: "confirmed",
        payment_status: "comp",
        amount_mad: 0,
        patient_notes: body.notes ?? null,
        proposed_by: psychologistId,
      })
      .select("id, video_room_id")
      .single();

    if (insertErr || !booking) {
      console.error("[send-meeting-link] insert error", insertErr);
      return new Response(
        JSON.stringify({ error: insertErr?.message ?? "Could not create booking" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: psyProfile } = await admin
      .from("psychologist_profiles")
      .select("full_name, photo_url")
      .eq("id", psychologistId)
      .maybeSingle();
    const psyName = psyProfile?.full_name ?? "Your psychologist";

    const escapeHtml = (s: string) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const origin = Deno.env.get("SITE_URL") ?? "https://upsy.ma";
    const joinUrl = `${origin}/video-call/${booking.video_room_id}`;

    const isNow = startMs <= Date.now() + 60 * 1000;
    const dateStr = isNow
      ? "Right now"
      : new Date(startMs).toLocaleString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,sans-serif;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="color:#6B1F2A;margin:0;font-size:22px;">U.Psy</h1>
    </div>
    <h2 style="color:#1a1a1a;margin:0 0 16px;">${escapeHtml(psyName)} is inviting you to a video session</h2>
    <p style="color:#444;line-height:1.6;margin:0 0 20px;">
      Click the button below to join the secure video room. No account required.
    </p>
    <div style="background:#FAF7F5;border-left:4px solid #6B1F2A;padding:16px;margin:20px 0;border-radius:4px;">
      <p style="margin:0 0 6px;"><strong>When:</strong> ${dateStr}</p>
      <p style="margin:0;"><strong>Duration:</strong> ${body.duration_minutes} minutes</p>
      ${body.notes ? `<p style="margin:12px 0 0;font-style:italic;color:#666;">"${escapeHtml(body.notes)}"</p>` : ""}
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="${joinUrl}" style="display:inline-block;background:#6B1F2A;color:#ffffff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Join the session</a>
    </div>
    <p style="color:#666;font-size:13px;text-align:center;margin:16px 0 0;word-break:break-all;">
      Or paste this link in your browser:<br/>
      <a href="${joinUrl}" style="color:#6B1F2A;">${joinUrl}</a>
    </p>
    <p style="color:#888;font-size:12px;line-height:1.5;text-align:center;margin-top:32px;">
      The link stays active until the session ends.<br/>
      Need help? Reply to this email.<br/>
      Conformément à la loi 09-08, vos données personnelles sont protégées.
    </p>
  </div>
</body></html>`;

    // Persist phone on booking for downstream WhatsApp reminders
    if (body.client_phone) {
      await admin
        .from("bookings")
        .update({ patient_phone: body.client_phone })
        .eq("id", booking.id);
    }

    // 1) In-app notification for the client (only if they have an account)
    if (existingUser?.id) {
      await admin.from("notifications").insert({
        user_id: existingUser.id,
        type: "session_invite",
        title: `${psyName} invited you to a session`,
        body: `${dateStr} · ${body.duration_minutes} min`,
        action_url: joinUrl,
        metadata: { booking_id: booking.id, video_room_id: booking.video_room_id },
      });
    }

    // 2) WhatsApp deep-link (no API needed, just opens WhatsApp prefilled)
    const waText = encodeURIComponent(
      `${psyName} invited you to a U.Psy video session.\n${dateStr} (${body.duration_minutes} min)\nJoin: ${joinUrl}`,
    );
    const whatsappDeeplink = body.client_phone
      ? `https://wa.me/${body.client_phone.replace(/[^\d]/g, "")}?text=${waText}`
      : `https://wa.me/?text=${waText}`;

    // 3) .ics calendar invite (data URL — clients can attach in their browser/inbox)
    const ics = buildIcs({
      uid: booking.id,
      start: new Date(startMs),
      durationMin: body.duration_minutes,
      summary: `Session with ${psyName} — U.Psy`,
      description: `Join the secure video room: ${joinUrl}`,
      url: joinUrl,
    });
    const icsDataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;
    if (RESEND_API_KEY) {
      try {
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: sender(),
            to: [email],
            subject: `Video session with ${psyName.replace(/[\r\n<>]/g, " ")} — Join link`,
            html,
            attachments: [
              {
                filename: "session.ics",
                content: btoa(unescape(encodeURIComponent(ics))),
              },
            ],
          }),
        });
        emailSent = resp.ok;
        if (!resp.ok) {
          console.warn("[send-meeting-link] email send failed", await resp.text());
        }
      } catch (e) {
        console.warn("[send-meeting-link] email error", e);
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        booking_id: booking.id,
        join_url: joinUrl,
        video_room_id: booking.video_room_id,
        email_sent: emailSent,
        whatsapp_deeplink: whatsappDeeplink,
        ics_data_url: icsDataUrl,
        in_app_notified: Boolean(existingUser?.id),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("[send-meeting-link] unhandled", e);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});