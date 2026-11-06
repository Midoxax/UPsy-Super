// Session reminders cron — runs every ~10 minutes.
// Sends 24h / 1h / 5min reminder waves for upcoming bookings.
// Channels: email + in-app notification + WhatsApp deep-link metadata.
// Recipients: client always; specialist only at the 1h wave.
// Dedupe: booking_reminders_sent (booking_id, reminder_type, recipient_role, channel).

import { reminderEmail } from "../_shared/email/reminder.ts";
import { normaliseLocale } from "../_shared/email/layout.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sender } from "../_shared/sender.ts";
import { SITE_URL } from "../_shared/site.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
  payment_status: string | null;
  video_room_id: string | null;
  reminder_24h_enabled: boolean;
  reminder_1h_enabled: boolean;
  reminder_5min_enabled: boolean;
  reminder_channels: string[] | null;
}

const WAVE_WINDOWS: Record<
  Wave,
  { earliestMinutes: number; latestMinutes: number }
> = {
  // wave triggers when the booking starts within [earliest, latest] minutes from now
  "24h": { earliestMinutes: 23 * 60 + 30, latestMinutes: 24 * 60 + 30 }, // 23h30 → 24h30
  "1h": { earliestMinutes: 50, latestMinutes: 70 },
  "5min": { earliestMinutes: 1, latestMinutes: 10 },
};

const WAVE_FOR_RECIPIENT: Record<RecipientRole, Wave[]> = {
  client: ["24h", "1h", "5min"],
  specialist: ["1h"],
};

function formatDate(iso: string, locale = "fr-FR") {
  return new Date(iso).toLocaleString(locale, {
    timeZone: "Africa/Casablanca",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function sendEmail(opts: {
  apiKey: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
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
        ...(opts.text ? { text: opts.text } : {}),
      }),
    });
    if (!resp.ok)
      console.warn("[reminder] resend failed", resp.status, await resp.text());
    return resp.ok;
  } catch (e) {
    console.warn("[reminder] resend error", e);
    return false;
  }
}

async function sendWhatsAppApi(opts: {
  phoneNumberId: string;
  token: string;
  toE164: string; // without leading +
  templateName?: string; // approved template
  bodyText?: string; // freeform (only works inside 24h window)
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
    if (!resp.ok)
      console.warn(
        "[reminder] whatsapp failed",
        resp.status,
        await resp.text(),
      );
    return resp.ok;
  } catch (e) {
    console.warn("[reminder] whatsapp error", e);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  // Only the scheduled job may run this: it sends the reminders_cron_secret
  // kept in Vault (see 20261020160000_reminders_cron_secret.sql). A
  // CRON_SECRET env var is still accepted as an alternative.
  const provided = (req.headers.get("Authorization") ?? "").replace(
    /^Bearer\s+/i,
    "",
  );
  const envSecret = Deno.env.get("CRON_SECRET");
  const { data: vaultOk } = await admin.rpc("cron_secret_ok", {
    p_name: "reminders_cron_secret",
    p_token: provided,
  });
  if (!vaultOk && !(envSecret && provided === envSecret)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
  const WA_TOKEN = Deno.env.get("WHATSAPP_API_TOKEN") ?? "";
  const WA_PHONE_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") ?? "";
  const WA_TEMPLATE = Deno.env.get("WHATSAPP_REMINDER_TEMPLATE") ?? "";
  const now = new Date();
  const horizon = new Date(now.getTime() + 26 * 3600 * 1000); // 26h ahead

  const { data: bookings, error } = await admin
    .from("bookings")
    .select(
      "id, patient_id, patient_email, patient_phone, psychologist_id, scheduled_at, duration_minutes, session_type, status, payment_status, video_room_id, reminder_24h_enabled, reminder_1h_enabled, reminder_5min_enabled, reminder_channels",
    )
    .gte("scheduled_at", new Date(now.getTime() - 5 * 60 * 1000).toISOString())
    .lte("scheduled_at", horizon.toISOString())
    // Only confirmed sessions: a pending request or an unanswered proposal
    // is not on anyone's calendar yet.
    .eq("status", "confirmed");

  if (error) {
    console.error("[reminder] bookings query failed", error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let scanned = 0,
    dispatched = 0,
    skipped = 0;
  const origin = SITE_URL;

  for (const b of (bookings ?? []) as BookingRow[]) {
    scanned++;
    const startMs = new Date(b.scheduled_at).getTime();
    const minutesUntil = Math.round((startMs - now.getTime()) / 60000);

    // Determine which wave (if any) this booking falls in
    let wave: Wave | null = null;
    for (const w of ["5min", "1h", "24h"] as Wave[]) {
      const win = WAVE_WINDOWS[w];
      if (
        minutesUntil >= win.earliestMinutes &&
        minutesUntil <= win.latestMinutes
      ) {
        wave = w;
        break;
      }
    }
    if (!wave) {
      skipped++;
      continue;
    }

    // Per-booking toggles
    if (wave === "24h" && !b.reminder_24h_enabled) {
      skipped++;
      continue;
    }
    if (wave === "1h" && !b.reminder_1h_enabled) {
      skipped++;
      continue;
    }
    if (wave === "5min" && !b.reminder_5min_enabled) {
      skipped++;
      continue;
    }

    const channels = new Set<string>(
      b.reminder_channels ?? ["email", "in_app"],
    );
    const joinUrl = b.video_room_id
      ? `${origin}/session/${b.id}`
      : `${origin}/my-space?tab=sessions`;
    const whenLabel = formatDate(b.scheduled_at);

    // Emails and languages come from the auth accounts. (A
    // .schema("auth") query is refused through the API, which left every
    // reminder email unsent: only in-app reminders ever went out.)
    const psyUser = (await admin.auth.admin.getUserById(b.psychologist_id)).data
      .user;
    const clientUser = b.patient_id
      ? (await admin.auth.admin.getUserById(b.patient_id)).data.user
      : null;
    const psyEmail = psyUser?.email ?? null;
    const clientEmail = b.patient_email ?? clientUser?.email ?? null;
    const psyLocale = normaliseLocale(psyUser?.user_metadata?.locale);
    const clientLocale = normaliseLocale(clientUser?.user_metadata?.locale);
    const { data: clientProfile } = b.patient_id
      ? await admin
          .from("profiles")
          .select("full_name")
          .eq("id", b.patient_id)
          .maybeSingle()
      : { data: null };
    const clientName = clientProfile?.full_name ?? "Client";

    const { data: psyProfile } = await admin
      .from("psychologist_profiles")
      .select("full_name")
      .eq("id", b.psychologist_id)
      .maybeSingle();
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

      // 1) In-app notification
      if (
        channels.has("in_app") &&
        !sentChannels.has("in_app") &&
        recipientUserId
      ) {
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
          action_url:
            b.session_type === "video" ? joinUrl : "/my-space?tab=sessions",
          metadata: { booking_id: b.id, wave, role },
        });
        if (!nErr) {
          await admin.from("booking_reminders_sent").insert({
            booking_id: b.id,
            reminder_type: wave,
            recipient_role: role,
            channel: "in_app",
          });
          dispatched++;
        }
      }

      // 2) Email
      if (
        channels.has("email") &&
        !sentChannels.has("email") &&
        recipientEmail &&
        RESEND_API_KEY
      ) {
        const mail = reminderEmail({
          wave,
          locale: isSpecialist ? psyLocale : clientLocale,
          isSpecialist,
          otherName: isSpecialist ? clientName : psyName,
          start: new Date(b.scheduled_at),
          durationMin: b.duration_minutes ?? 50,
          joinUrl,
          payUrl:
            !isSpecialist &&
            wave === "24h" &&
            !["paid", "comp"].includes(b.payment_status ?? "")
              ? `https://upsy.ma/dashboard/client?tab=billing&pay=${b.id}`
              : undefined,
        });
        const ok = await sendEmail({
          apiKey: RESEND_API_KEY,
          to: recipientEmail,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
        });
        if (ok) {
          await admin.from("booking_reminders_sent").insert({
            booking_id: b.id,
            reminder_type: wave,
            recipient_role: role,
            channel: "email",
          });
          dispatched++;
        }
      }

      // 3) WhatsApp Business API auto-send (only if creds configured + phone present, client only)
      if (
        !isSpecialist &&
        channels.has("whatsapp") &&
        !sentChannels.has("whatsapp_api") &&
        WA_TOKEN &&
        WA_PHONE_ID &&
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
            booking_id: b.id,
            reminder_type: wave,
            recipient_role: role,
            channel: "whatsapp_api",
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
