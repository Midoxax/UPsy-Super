import { createClient } from "npm:@supabase/supabase-js@2";
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

/**
 * Emails the notifications marked email_status = 'pending'
 * (20261123090000_notification_emails.sql): League membership, payments,
 * passport reviews, interviews, publication orders and staff alerts.
 *
 * Run by pg_cron every two minutes with the Vault secret
 * notification_emails_cron_secret; nothing else may call it. Honours the
 * user's email preferences and the suppression list; a failed send is
 * retried on the next runs, three tries in all.
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const BATCH = 40;
const MAX_ATTEMPTS = 3;
const MAX_AGE_MS = 2 * 24 * 3600 * 1000;
const SEND_GAP_MS = 600; // Resend allows about two requests a second.

/** Which preference switch governs each type; staff alerts always go out. */
const PREF: Record<string, string | null> = {
  league: "email_league",
  passport: "email_league",
  recruitment: "email_league",
  shop: "email_payments",
  league_staff: null,
  shop_admin: null,
  // Webinar notices go to registrants: confirmation, reminders, replay.
  training: null,
  league_training: null,
  // The race engineer's weekly report (Performance Center).
  performance: "email_performance",
};
const LEAGUE_TYPES = new Set([
  "league",
  "passport",
  "recruitment",
  "league_staff",
  "league_training",
]);

const OPEN: Record<Locale, string> = {
  fr: "Ouvrir dans U.Psy",
  en: "Open in U.Psy",
  ar: "فتح في U.Psy",
};
const EYEBROW: Record<string, string> = {
  league: "LSSPM",
  passport: "Passeport du psychologue",
  recruitment: "Recrutement LSSPM",
  league_staff: "Portail de la Ligue",
  shop: "Publications U.Psy",
  shop_admin: "Administration U.Psy",
  training: "Formation U.Psy",
  league_training: "Formation LSSPM",
  performance: "Centre de performance U.Psy",
};

type Row = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  action_url: string | null;
  created_at: string;
  email_attempts: number;
};

function render(n: Row, locale: Locale) {
  const href = n.action_url?.startsWith("/")
    ? `${SITE_URL}${n.action_url}`
    : undefined;
  const paragraphs = (n.body ?? "")
    .split(/\n{2,}/)
    .filter((t) => t.trim())
    .map((t) => rich(escapeHtml(t).replace(/\n/g, "<br>"), locale))
    .join("");
  return renderEmail({
    locale,
    preheader: (n.body ?? n.title).split("\n")[0].slice(0, 120),
    eyebrow: EYEBROW[n.type],
    title: n.title,
    body: paragraphs + (href ? button(OPEN[locale], href, locale) : ""),
    partner: LEAGUE_TYPES.has(n.type) ? "lsspm" : undefined,
  });
}

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });
  const bearer = (req.headers.get("Authorization") ?? "").replace(
    /^Bearer\s+/i,
    "",
  );
  const { data: ok } = await admin.rpc("cron_secret_ok", {
    p_name: "notification_emails_cron_secret",
    p_token: bearer,
  });
  if (!ok) return json({ error: "Unauthorized" }, 401);
  if (!RESEND_API_KEY) return json({ error: "RESEND_API_KEY missing" }, 500);

  const { data: rows, error } = await admin
    .from("notifications")
    .select(
      "id, user_id, type, title, body, action_url, created_at, email_attempts",
    )
    .eq("email_status", "pending")
    .order("created_at")
    .limit(BATCH);
  if (error) return json({ error: error.message }, 500);

  const mark = (id: string, patch: Record<string, unknown>) =>
    admin.from("notifications").update(patch).eq("id", id);
  const counts = { sent: 0, skipped: 0, failed: 0 };
  const skip = async (n: Row) => {
    counts.skipped++;
    await mark(n.id, { email_status: "skipped" });
  };

  for (const n of (rows ?? []) as Row[]) {
    if (Date.now() - new Date(n.created_at).getTime() > MAX_AGE_MS) {
      await skip(n);
      continue;
    }
    const prefKey = PREF[n.type];
    if (prefKey === undefined) {
      await skip(n);
      continue;
    }
    if (prefKey) {
      const { data: prefs } = await admin
        .from("notification_preferences")
        .select(prefKey)
        .eq("user_id", n.user_id)
        .maybeSingle();
      if (
        prefs &&
        (prefs as unknown as Record<string, boolean>)[prefKey] === false
      ) {
        await skip(n);
        continue;
      }
    }
    const { data: u } = await admin.auth.admin.getUserById(n.user_id);
    const email = u?.user?.email?.toLowerCase();
    if (!email) {
      await skip(n);
      continue;
    }
    const { data: suppressed } = await admin
      .from("suppressed_emails")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (suppressed) {
      await skip(n);
      continue;
    }

    const html = render(n, normaliseLocale(u.user?.user_metadata?.locale));
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `notification-${n.id}`,
      },
      body: JSON.stringify({
        from: sender(),
        to: [email],
        subject: n.title,
        html,
        text: toText(html),
      }),
    });
    if (res.ok) {
      counts.sent++;
      await mark(n.id, {
        email_status: "sent",
        emailed_at: new Date().toISOString(),
        email_attempts: n.email_attempts + 1,
      });
    } else {
      counts.failed++;
      const attempts = n.email_attempts + 1;
      console.error("notification email failed", {
        id: n.id,
        status: res.status,
        detail: (await res.text()).slice(0, 300),
      });
      await mark(n.id, {
        email_attempts: attempts,
        email_status: attempts >= MAX_ATTEMPTS ? "failed" : "pending",
      });
      if (res.status === 429) break;
    }
    await new Promise((r) => setTimeout(r, SEND_GAP_MS));
  }
  return json(counts);
});
