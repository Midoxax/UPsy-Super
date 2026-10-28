// Newsletter sign-up from the site (footer, blog). Double opt-in: the address
// is stored as pending and receives a confirmation link; the monthly digest
// only goes to confirmed addresses. The answer is the same whatever the
// address's state, so the endpoint cannot be used to probe the list, and a
// confirmation is sent at most once a day per address.
import * as React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { SITE_URL } from "../_shared/site.ts";
import {
  queueMarketingEmail,
  unsubscribeTokenFor,
} from "../_shared/marketing-mail.ts";
import {
  Confirm,
  confirmSubject,
  type Lang,
} from "../_shared/newsletter/templates.tsx";

const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return reply({ error: "POST only" }, 405);

  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const lang: Lang =
    body.locale === "en" || body.locale === "ar" ? body.locale : "fr";
  const source =
    String(body.source ?? "site")
      .replace(/[^a-z0-9_-]/gi, "")
      .slice(0, 40) || "site";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
    return reply({ error: "invalid_email" }, 400);
  }

  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { error } = await db.rpc("newsletter_subscribe", {
    p_email: email,
    p_locale: lang,
    p_source: source,
  });
  if (error) return reply({ error: "failed" }, 500);

  // One CRM identity per person, with what first brought them (UTM tags
  // captured on their first visit). Best effort: never blocks subscribing.
  const firstTouch =
    body.first_touch && typeof body.first_touch === "object"
      ? Object.fromEntries(
          Object.entries(body.first_touch as Record<string, unknown>)
            .filter(([, v]) => typeof v === "string")
            .slice(0, 10)
            .map(([k, v]) => [k.slice(0, 40), String(v).slice(0, 200)]),
        )
      : {};
  await db
    .rpc("crm_upsert_contact", {
      _email: email,
      _locale: lang,
      _contact_type: "client",
      _source: `newsletter_${source}`.slice(0, 40),
      _first_touch: firstTouch,
      _activity_kind: "form_submitted",
      _activity_subject: "Newsletter subscription",
    })
    .then(({ error: e }) => e && console.error("crm upsert:", e.message));

  const { data: sub } = await db
    .from("newsletter_subscribers")
    .select("id, status, confirm_token, confirmation_sent_at")
    .eq("email", email)
    .single();
  const recent =
    sub?.confirmation_sent_at &&
    Date.now() - new Date(sub.confirmation_sent_at).getTime() < 86400000;
  if (sub && sub.status === "pending" && !recent) {
    const tok = await unsubscribeTokenFor(db, email);
    if (tok) {
      const prefix = lang === "en" ? "" : `/${lang}`;
      const el = React.createElement(Confirm, {
        lang,
        confirmUrl: `${SITE_URL}${prefix}/newsletter/confirm?token=${sub.confirm_token}`,
      });
      await queueMarketingEmail(db, {
        to: email,
        subject: confirmSubject(lang),
        html: await renderAsync(el),
        text: await renderAsync(el, { plainText: true }),
        label: "newsletter-confirm",
        idempotencyKey: `newsletter-confirm:${sub.id}:${new Date().toISOString().slice(0, 10)}`,
        unsubscribeToken: tok,
      });
      await db
        .from("newsletter_subscribers")
        .update({ confirmation_sent_at: new Date().toISOString() })
        .eq("id", sub.id);
    }
  }
  return reply({ ok: true });
});
