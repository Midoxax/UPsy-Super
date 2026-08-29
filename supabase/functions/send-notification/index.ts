import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sender } from "../_shared/sender.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const TYPE_TO_PREF: Record<string, keyof Prefs> = {
  payment_succeeded: "email_payments",
  payout_processed: "email_payments",
  booking_confirmed: "email_bookings",
  booking_proposed: "email_bookings",
  session_reminder: "email_reminders",
  badge_unlocked: "email_gamification",
  level_up: "email_gamification",
  streak_at_risk: "email_gamification",
};

type Prefs = {
  email_payments: boolean;
  email_bookings: boolean;
  email_reminders: boolean;
  email_gamification: boolean;
  inapp_all: boolean;
};

const DEFAULT_PREFS: Prefs = {
  email_payments: true,
  email_bookings: true,
  email_reminders: true,
  email_gamification: false,
  inapp_all: true,
};

function brandedEmail(title: string, body: string, actionUrl?: string) {
  const cta = actionUrl
    ? `<a href="${actionUrl}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#6B1F2A;color:#fff;text-decoration:none;border-radius:12px;font-family:Inter,sans-serif;font-weight:600">Open in U.Psy</a>`
    : "";
  return `<!doctype html>
<html><body style="margin:0;padding:32px;background:#F7F3F0;font-family:Inter,Arial,sans-serif;color:#2a1a1d">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:20px;padding:32px;border:1px solid #e9dfd8">
    <div style="font-family:'Outfit',sans-serif;color:#6B1F2A;font-weight:700;font-size:14px;letter-spacing:2px;margin-bottom:8px">U.PSY</div>
    <h1 style="font-family:'Outfit',sans-serif;font-size:22px;margin:0 0 12px;color:#2a1a1d">${title}</h1>
    <p style="font-size:15px;line-height:1.6;color:#5a4a4d;white-space:pre-wrap">${body}</p>
    ${cta}
    <hr style="border:none;border-top:1px solid #f0e6df;margin:32px 0 16px" />
    <p style="font-size:12px;color:#a09590;margin:0">U.Psy — Performance Psychology System</p>
  </div>
</body></html>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY || !LOVABLE_API_KEY) return { skipped: true };
  const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
    },
    body: JSON.stringify({
      from: sender(),
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: text };
  }
  return { ok: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Restrict to internal callers (service role) only.
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token || token !== SERVICE_ROLE) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const body = await req.json();
    const {
      user_id,
      type,
      title,
      body: messageBody,
      action_url,
      metadata = {},
      send_email = false,
    } = body ?? {};

    if (!user_id || !type || !title) {
      return new Response(
        JSON.stringify({ error: "user_id, type and title are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    // Load preferences (or default)
    const { data: prefRow } = await admin
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();
    const prefs: Prefs = { ...DEFAULT_PREFS, ...(prefRow ?? {}) };

    // Insert in-app row if user allows
    let notif: { id: string } | null = null;
    if (prefs.inapp_all) {
      const { data, error } = await admin
        .from("notifications")
        .insert({
          user_id,
          type,
          title,
          body: messageBody ?? null,
          action_url: action_url ?? null,
          metadata,
        })
        .select("id")
        .single();
      if (error) {
        console.error("notif insert error", error);
      } else {
        notif = data;
      }
    }

    // Email if requested + opted-in
    let emailResult: unknown = { skipped: true };
    if (send_email) {
      const prefKey = TYPE_TO_PREF[type];
      const allowEmail = prefKey ? prefs[prefKey] : false;
      if (allowEmail) {
        // fetch user email from auth via admin
        const { data: userRes } = await admin.auth.admin.getUserById(user_id);
        const email = userRes?.user?.email;
        if (email) {
          const html = brandedEmail(title, messageBody ?? "", action_url);
          emailResult = await sendEmail(email, title, html);
        }
      }
    }

    return new Response(
      JSON.stringify({ ok: true, notification_id: notif?.id ?? null, email: emailResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-notification error", e);
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});