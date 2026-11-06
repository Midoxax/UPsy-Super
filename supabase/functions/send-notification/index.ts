import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sender } from "../_shared/sender.ts";
import {
  button,
  escapeHtml,
  type Locale,
  normaliseLocale,
  renderEmail,
  rich,
  toText,
} from "../_shared/email/layout.ts";
import { SITE_URL } from "../_shared/site.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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

/** Absolute link for the CTA: relative paths resolve against SITE_URL. */
function absoluteUrl(actionUrl?: string): string | undefined {
  if (!actionUrl || typeof actionUrl !== "string") return undefined;
  if (actionUrl.startsWith("/")) return `${SITE_URL}${actionUrl}`;
  return /^https?:\/\//i.test(actionUrl) ? actionUrl : undefined;
}

const OPEN_LABEL: Record<Locale, string> = {
  fr: "Ouvrir dans U.Psy",
  en: "Open in U.Psy",
  ar: "فتح في U.Psy",
};

function brandedEmail(
  title: string,
  body: string,
  actionUrl: string | undefined,
  locale: Locale,
) {
  const href = absoluteUrl(actionUrl);
  const paragraphs = body
    .split(/\n{2,}/)
    .filter((t) => t.trim())
    .map((t) => rich(escapeHtml(t).replace(/\n/g, "<br>"), locale))
    .join("");
  return renderEmail({
    locale,
    preheader: body.split("\n")[0].slice(0, 120) || title,
    title,
    body: paragraphs + (href ? button(OPEN_LABEL[locale], href, locale) : ""),
  });
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) return { skipped: true };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: sender(),
      to: [to],
      subject,
      html,
      text: toText(html),
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
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
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
          const locale = normaliseLocale(userRes?.user?.user_metadata?.locale);
          const html = brandedEmail(
            title,
            messageBody ?? "",
            action_url,
            locale,
          );
          emailResult = await sendEmail(email, title, html);
        }
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        notification_id: notif?.id ?? null,
        email: emailResult,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("send-notification error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
