import { createClient } from "npm:@supabase/supabase-js@2";
import { SITE_URL } from "../_shared/site.ts";

/**
 * The topic vote in the newsletter: /newsletter-vote?p=<YYYY-MM>&c=<topic>&t=<token>
 * records one vote per reader and issue (a second click changes it), then
 * sends the reader to the newsletter page, which thanks them. The token is
 * the reader's unsubscribe token, already in the same email; an unknown or
 * used token records nothing. See 20261127120000_newsletter_web.sql.
 */

const TOPICS = new Set([
  "stress",
  "sleep",
  "performance",
  "relationships",
  "parenting",
  "work",
]);

const go = (path: string) =>
  new Response(null, {
    status: 302,
    headers: {
      Location: `${SITE_URL}${path}`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const period = url.searchParams.get("p") ?? "";
  const topic = url.searchParams.get("c") ?? "";
  const token = url.searchParams.get("t") ?? "";
  if (
    !/^[0-9]{4}-[0-9]{2}$/.test(period) ||
    !TOPICS.has(topic) ||
    !/^[0-9a-f]{64}$/.test(token)
  ) {
    return go("/fr/newsletter");
  }

  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
  const { data: t } = await db
    .from("email_unsubscribe_tokens")
    .select("email, used_at")
    .eq("token", token)
    .maybeSingle();
  if (!t || t.used_at) return go("/fr/newsletter");

  const email = String(t.email).toLowerCase();
  await db
    .from("newsletter_votes")
    .upsert({ period, email, topic }, { onConflict: "period,email" });
  const { data: sub } = await db
    .from("newsletter_subscribers")
    .select("locale")
    .eq("email", email)
    .maybeSingle();
  const prefix =
    sub?.locale === "en" ? "" : sub?.locale === "ar" ? "/ar" : "/fr";
  return go(`${prefix}/newsletter?voted=${topic}`);
});
