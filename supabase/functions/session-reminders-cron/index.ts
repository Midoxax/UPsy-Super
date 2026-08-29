// Session reminders cron — runs every ~10 minutes.
// Sends 24h / 1h / 5min reminder waves for upcoming bookings.
// Channels: email + in-app notification + WhatsApp deep-link metadata.
// Recipients: client always; specialist only at the 1h wave.
// Dedupe: booking_reminders_sent (booking_id, reminder_type, recipient_role, channel).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sender } from "../_shared/sender.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Wave = "24h" | "1h" | "5min";
type RecipientRole = "client" | "specialist";

interface BookingRow {
  id: string;
  patient_id: string | null;
  patient_email: string | null;
  patient_phone: string | null;
  psychologist_id: string;
  scheduled_at: string;
  duration_minutes: number;
  session_type: string;
  status: string;
  video_room_id: string | null;
  reminder_24h_enabled: boolean;
  reminder_1h_enabled: boolean;
  reminder_5min_enabled: boolean;
  reminder_channels: string[] | null;
}

const WAVE_WINDOWS: Record<Wave, { earliestMinutes: number; latestMinutes: number }> = {
  // wave triggers when the booking starts within [earliest, latest] minutes from now
  "24h":  { earliestMinutes: 23 * 60 + 30, latestMinutes: 24 * 60 + 30 }, // 23h30 → 24h30
  "1h":   { earliestMinutes: 50,           latestMinutes: 70 },
  "5min": { earliestMinutes: 1,            latestMinutes: 10 },
};

const WAVE_FOR_RECIPIENT: Record<RecipientRole, Wave[]> = {
  client: ["24h", "1h", "5min"],
  specialist: ["1h"],
};

function formatDate(iso: string, locale = "fr-FR") {
  return new Date(iso).toLocaleString(locale, {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function emailHtml(p: {
  joinUrl: string;
  whenLabel: string;
  durationMin: number;
  wave: Wave;
  greeting: string;
  isSpecialist: boolean;
}) {
  const headline =
    p.wave === "5min"
      ? "Your session starts in a few minutes"
      : p.wave === "1h"
      ? "Your session starts in 1 hour"
      : "Reminder: your session is tomorrow";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,sans-serif;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="color:#6B1F2A;margin:0;font-size:22px;">U.Psy</h1>
    </div>
    <h2 style="color:#1a1a1a;margin:0 0 16px;">${headline}</h2>
    <p style="color:#444;line-height:1.6;margin:0 0 20px;">${p.greeting}</p>
    <div style="background:#FAF7F5;border-left:4px solid #6B1F2A;padding:16px;margin:20px 0;border-radius:4px;">
      <p style="margin:0 0 6px;"><strong>When:</strong> ${p.whenLabel}</p>
      <p style="margin:0;"><strong>Duration:</strong> ${p.durationMin} minutes</p>
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="${p.joinUrl}" style="display:inline-block;background:#6B1F2A;color:#ffffff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">${p.isSpecialist ? "Open consultation room" : "Join the session"}</a>
    </div>
    <p style="color:#666;font-size:13px;text-align:center;margin:16px 0 0;word-break:break-all;">
      Or paste this link in your browser:<br/>
      <a href="${p.joinUrl}" style="color:#6B1F2A;">${p.joinUrl}</a>
    </p>
    <p style="color:#888;font-size:12px;line-height:1.5;text-align:center;margin-top:32px;">
      Conformément à la loi 09-08, vos données personnelles sont protégées.
    </p>
  </div>
</body></html>`;
}

async function sendEmail(opts: {
  apiKey: string; to: string; subject: string; html: string;
}): Promise<boolean> {
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender(),
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
    });
    if (!resp.ok) console.warn("[reminder] resend failed", resp.status, await resp.text());
    return resp.ok;
  } catch (e) {
    console.warn("[reminder] resend error", e);
    return false;
  }
}

async function sendWhatsAppApi(opts: {
  phoneNumberId: string;
  token: string;
  toE164: string;        // without leading +
  templateName?: string; // approved template
  bodyText?: string;     // freeform (only works inside 24h window)
}): Promise<boolean> {
  try {
    const url = `https://graph.facebook.com/v20.0/${opts.phoneNumberId}/messages`;
    const payload: any = {
      messaging_product: "whatsapp",
      to: opts.toE164,
      type: opts.templateName ? "template" : "text",
    };
    if (opts.templateName) {
      payload.template = { name: opts.templateName, language: { code: "en" } };
    } else if (opts.bodyText) {
      payload.text = { body: opts.bodyText };
    } else {
      return false;
    }
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) console.warn("[reminder] whatsapp failed", resp.status, await resp.text());
    return resp.ok;
  } catch (e) {
    console.warn("[reminder] whatsapp error", e);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Require cron secret for invocation
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (cronSecret) {
    const provided = req.headers.get("Authorization") ?? "";
    if (provided !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
  const WA_TOKEN = Deno.env.get("WHATSAPP_API_TOKEN") ?? "";
  const WA_PHONE_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") ?? "";
  const WA_TEMPLATE = Deno.env.get("WHATSAPP_REMINDER_TEMPLATE") ?? "";

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const now = new Date();
  const horizon = new Date(now.getTime() + 26 * 3600 * 1000); // 26h ahead

  const { data: bookings, error } = await admin
    .from("bookings")
    .select(
      "id, patient_id, patient_email, patient_phone, psychologist_id, scheduled_at, duration_minutes, session_type, status, video_room_id, reminder_24h_enabled, reminder_1h_enabled, reminder_5min_enabled, reminder_channels",
    )
    .gte("scheduled_at", new Date(now.getTime() - 5 * 60 * 1000).toISOString())
    .lte("scheduled_at", horizon.toISOString())
    .in("status", ["confirmed", "pending", "proposed"]);

  if (error) {
    console.error("[reminder] bookings query failed", error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let scanned = 0, dispatched = 0, skipped = 0;
  const origin = "https://upsy.ma";

  for (const b of (bookings ?? []) as BookingRow[]) {
    scanned++;
    const startMs = new Date(b.scheduled_at).getTime();
    const minutesUntil = Math.round((startMs - now.getTime()) / 60000);

    // Determine which wave (if any) this booking falls in
    let wave: Wave | null = null;
    for (const w of ["5min", "1h", "24h"] as Wave[]) {
      const win = WAVE_WINDOWS[w];
      if (minutesUntil >= win.earliestMinutes && minutesUntil <= win.latestMinutes) {
        wave = w; break;
      }
    }
    if (!wave) { skipped++; continue; }

    // Per-booking toggles
    if (wave === "24h" && !b.reminder_24h_enabled) { skipped++; continue; }
    if (wave === "1h" && !b.reminder_1h_enabled) { skipped++; continue; }
    if (wave === "5min" && !b.reminder_5min_enabled) { skipped++; continue; }

    const channels = new Set<string>(b.reminder_channels ?? ["email", "in_app"]);
    const joinUrl = b.video_room_id
      ? `${origin}/video-call/${b.video_room_id}`
      : `${origin}/my-space?tab=sessions`;
    const whenLabel = formatDate(b.scheduled_at);

    // Look up emails (specialist email comes from auth.users)
    const { data: psyAuth } = await admin
      .schema("auth").from("users").select("email").eq("id", b.psychologist_id).maybeSingle();
    const psyEmail = (psyAuth as any)?.email ?? null;

    let clientEmail = b.patient_email;
    if (!clientEmail && b.patient_id) {
      const { data: cAuth } = await admin
        .schema("auth").from("users").select("email").eq("id", b.patient_id).maybeSingle();
      clientEmail = (cAuth as any)?.email ?? null;
    }

    const { data: psyProfile } = await admin
      .from("psychologist_profiles")
      .select("full_name").eq("id", b.psychologist_id).maybeSingle();
    const psyName = psyProfile?.full_name ?? "your psychologist";

    for (const role of ["client", "specialist"] as RecipientRole[]) {
      if (!WAVE_FOR_RECIPIENT[role].includes(wave)) continue;
      const isSpecialist = role === "specialist";
      const recipientUserId = isSpecialist ? b.psychologist_id : b.patient_id;
      const recipientEmail = isSpecialist ? psyEmail : clientEmail;

      // Already-sent check (any channel for this wave+role short-circuits)
      const { data: existing } = await admin
        .from("booking_reminders_sent")
        .select("id, channel")
        .eq("booking_id", b.id)
        .eq("reminder_type", wave)
        .eq("recipient_role", role);
      const sentChannels = new Set((existing ?? []).map((r: any) => r.channel));

      const greeting = isSpecialist
        ? `Reminder: an upcoming session is on your calendar.`
        : `Reminder: your session with ${psyName} is coming up.`;

      // 1) In-app notification
      if (channels.has("in_app") && !sentChannels.has("in_app") && recipientUserId) {
        const { error: nErr } = await admin.from("notifications").insert({
          user_id: recipientUserId,
          type: "session_reminder",
          title:
            wave === "5min"
              ? "Session starting in a few minutes"
              : wave === "1h"
              ? "Session starting in 1 hour"
              : "Session tomorrow",
          body: isSpecialist
            ? `Upcoming session — ${whenLabel}.`
            : `Session with ${psyName} — ${whenLabel}.`,
          action_url: b.session_type === "video" ? joinUrl : "/my-space?tab=sessions",
          metadata: { booking_id: b.id, wave, role },
        });
        if (!nErr) {
          await admin.from("booking_reminders_sent").insert({
            booking_id: b.id, reminder_type: wave, recipient_role: role, channel: "in_app",
          });
          dispatched++;
        }
      }

      // 2) Email
      if (channels.has("email") && !sentChannels.has("email") && recipientEmail && RESEND_API_KEY) {
        const subject =
          wave === "5min"
            ? `Starting now — ${psyName}`
            : wave === "1h"
            ? `In 1 hour — session with ${psyName}`
            : `Tomorrow — session with ${psyName}`;
        const ok = await sendEmail({
          apiKey: RESEND_API_KEY,
          to: recipientEmail,
          subject,
          html: emailHtml({
            joinUrl, whenLabel, durationMin: b.duration_minutes,
            wave, greeting, isSpecialist,
          }),
        });
        if (ok) {
          await admin.from("booking_reminders_sent").insert({
            booking_id: b.id, reminder_type: wave, recipient_role: role, channel: "email",
          });
          dispatched++;
        }
      }

      // 3) WhatsApp Business API auto-send (only if creds configured + phone present, client only)
      if (
        !isSpecialist &&
        channels.has("whatsapp") &&
        !sentChannels.has("whatsapp_api") &&
        WA_TOKEN && WA_PHONE_ID &&
        b.patient_phone
      ) {
        const phone = b.patient_phone.replace(/[^\d]/g, "");
        const text =
          wave === "5min"
            ? `U.Psy — your session with ${psyName} starts now. Join: ${joinUrl}`
            : wave === "1h"
            ? `U.Psy reminder — your session with ${psyName} starts in 1 hour. ${whenLabel}. Join: ${joinUrl}`
            : `U.Psy reminder — your session with ${psyName} is tomorrow at ${whenLabel}. Join: ${joinUrl}`;
        const ok = await sendWhatsAppApi({
          phoneNumberId: WA_PHONE_ID,
          token: WA_TOKEN,
          toE164: phone,
          templateName: WA_TEMPLATE || undefined,
          bodyText: WA_TEMPLATE ? undefined : text,
        });
        if (ok) {
          await admin.from("booking_reminders_sent").insert({
            booking_id: b.id, reminder_type: wave, recipient_role: role, channel: "whatsapp_api",
            metadata: { phone_used: phone },
          });
          dispatched++;
        }
      }
    }
  }

  return new Response(
    JSON.stringify({ ok: true, scanned, dispatched, skipped }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
