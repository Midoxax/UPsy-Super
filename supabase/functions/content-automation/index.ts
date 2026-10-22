// Hourly content automation (see 20261022110000_content_automation.sql):
//  1. reads /blog-feed.json, the blog as the build published it;
//  2. queues each new post for LinkedIn / Facebook / Instagram and publishes
//     what is due (posts present at the first run are recorded as skipped,
//     so the back catalogue is not dumped on the accounts in one hour);
//  3. drafts next month's newsletter `newsletter_review_days` before the 1st,
//     emails the admins a preview, and sends it on the 1st in batches.
// Called by pg_cron with a Vault secret, or by an admin from the dashboard
// with an action: run | publish_post | preview | send_test | status.
import * as React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { SITE_URL } from "../_shared/site.ts";
import {
  queueMarketingEmail,
  unsubscribeTokenFor,
} from "../_shared/marketing-mail.ts";
import {
  Digest,
  digestSubject,
  type DigestItem,
  type Lang,
} from "../_shared/newsletter/templates.tsx";
import {
  caption,
  configured,
  publish,
  type Network,
} from "../_shared/social.ts";

const NETWORKS: Network[] = ["linkedin", "facebook", "instagram"];
const BATCH = 300;

type FeedItem = {
  slug: string;
  date: string;
  legacy: boolean;
  url: Record<"en" | "fr", string>;
  title: Record<"en" | "fr", string>;
  description: Record<"en" | "fr", string>;
  category: Record<"en" | "fr", string>;
  readMinutes: number;
  image: string | null;
};

const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function loadFeed(): Promise<FeedItem[]> {
  const res = await fetch(`${SITE_URL}/blog-feed.json`, {
    headers: { "Cache-Control": "no-cache" },
  });
  if (!res.ok) throw new Error(`blog-feed.json: HTTP ${res.status}`);
  return (await res.json()).items as FeedItem[];
}

/** Next 09:00 Morocco time (08:00 UTC) from now. */
function nextMorningSlot(now = new Date()) {
  const d = new Date(now);
  d.setUTCHours(8, 0, 0, 0);
  if (d <= now) d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

// --- Social ------------------------------------------------------------------
async function syncSocial(db: SupabaseClient, feed: FeedItem[], s: Settings) {
  const { data: rows } = await db.from("social_posts").select("slug, network");
  const have = new Set((rows ?? []).map((r) => `${r.slug}:${r.network}`));
  const firstRun = have.size === 0;
  const out = { created: 0, published: 0, failed: 0, needs_setup: 0 };

  const fresh = [];
  for (const it of feed) {
    for (const n of NETWORKS) {
      if (have.has(`${it.slug}:${n}`)) continue;
      const enabled = s.social_networks.includes(n);
      const baseline = firstRun || it.legacy;
      fresh.push({
        slug: it.slug,
        network: n,
        status:
          baseline || !enabled
            ? "skipped"
            : n === "instagram" && !it.image
              ? "skipped"
              : s.social_auto_publish
                ? "approved"
                : "pending",
        error: baseline
          ? "Published before automation started; post it from the dashboard if wanted"
          : !enabled
            ? "Network turned off in settings"
            : n === "instagram" && !it.image
              ? "No image for Instagram (add public/social/<slug>.jpg)"
              : null,
        caption: caption(n, {
          title: it.title.fr,
          description: it.description.fr,
          category: it.category.fr,
          url: it.url.fr,
        }),
        link: it.url.fr,
        image_url: it.image,
        scheduled_for: nextMorningSlot().toISOString(),
      });
    }
  }
  if (fresh.length) {
    await db
      .from("social_posts")
      .upsert(fresh, { onConflict: "slug,network", ignoreDuplicates: true });
    out.created = fresh.length;
  }

  const { data: due } = await db
    .from("social_posts")
    .select("*")
    .in("status", ["approved", "needs_setup"])
    .lte("scheduled_for", new Date().toISOString())
    .lt("attempts", 3)
    .limit(10);
  for (const p of due ?? []) {
    const r = await publishOne(db, p, feed);
    out[r]++;
  }
  return out;
}

async function publishOne(
  db: SupabaseClient,
  p: Record<string, any>,
  feed: FeedItem[],
): Promise<"published" | "failed" | "needs_setup"> {
  const n = p.network as Network;
  if (!configured(n)) {
    await db
      .from("social_posts")
      .update({ status: "needs_setup", error: `${n} credentials are not set` })
      .eq("id", p.id);
    return "needs_setup";
  }
  const it = feed.find((x) => x.slug === p.slug);
  try {
    const id = await publish(n, {
      caption: p.caption,
      link: p.link,
      image_url: p.image_url,
      title: it?.title.fr,
      description: it?.description.fr,
    });
    await db
      .from("social_posts")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        external_id: id,
        error: null,
      })
      .eq("id", p.id);
    return "published";
  } catch (e) {
    const attempts = (p.attempts ?? 0) + 1;
    await db
      .from("social_posts")
      .update({
        attempts,
        status: attempts >= 3 ? "failed" : p.status,
        error: String(e).slice(0, 500),
      })
      .eq("id", p.id);
    return "failed";
  }
}

// --- Newsletter ----------------------------------------------------------------
type Settings = {
  newsletter_enabled: boolean;
  newsletter_review_days: number;
  social_auto_publish: boolean;
  social_networks: string[];
};

const langOf = (l: string): Lang => (l === "en" || l === "ar" ? l : "fr");

function digestItems(items: FeedItem[], lang: Lang): DigestItem[] {
  // Arabic readers get the French article (as on the site).
  const k = lang === "en" ? "en" : "fr";
  return items.map((it) => ({
    slug: it.slug,
    title: it.title[k],
    description: it.description[k],
    category: it.category[k],
    readMinutes: it.readMinutes,
    url: `${it.url[k]}?utm_source=newsletter&utm_medium=email`,
    image: it.image,
  }));
}

async function renderDigest(
  issue: Record<string, any>,
  lang: Lang,
  unsubscribeUrl: string,
) {
  const el = React.createElement(Digest, {
    lang,
    intro: lang === "en" ? issue.intro_en : issue.intro_fr,
    items: digestItems(issue.items, lang),
    siteUrl: SITE_URL,
    unsubscribeUrl,
  });
  return {
    subject: digestSubject(lang, issue.period),
    html: await renderAsync(el),
    text: await renderAsync(el, { plainText: true }),
  };
}

async function adminEmails(db: SupabaseClient): Promise<string[]> {
  const { data: roles } = await db
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin");
  const emails: string[] = [];
  for (const r of roles ?? []) {
    const { data } = await db.auth.admin.getUserById(r.user_id);
    if (data.user?.email) emails.push(data.user.email);
  }
  return emails;
}

async function newsletter(db: SupabaseClient, feed: FeedItem[], s: Settings) {
  const out: Record<string, unknown> = {};
  if (!s.newsletter_enabled) return { disabled: true };
  const now = new Date();

  // 1. Draft next month's issue once inside the review window.
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 8),
  );
  const period = next.toISOString().slice(0, 7);
  const draftFrom = new Date(
    next.getTime() - s.newsletter_review_days * 86400000,
  );
  if (now >= draftFrom) {
    const { data: existing } = await db
      .from("newsletter_issues")
      .select("id")
      .eq("period", period)
      .maybeSingle();
    if (!existing) {
      const { data: last } = await db
        .from("newsletter_issues")
        .select("items, created_at")
        .eq("status", "sent")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const sentSlugs = new Set(
        ((last?.items as FeedItem[]) ?? []).map((i) => i.slug),
      );
      const since = last
        ? new Date(last.created_at).toISOString().slice(0, 10)
        : new Date(now.getTime() - 45 * 86400000).toISOString().slice(0, 10);
      const items = feed.filter(
        (i) => !i.legacy && i.date >= since && !sentSlugs.has(i.slug),
      );
      const { data: issue } = await db
        .from("newsletter_issues")
        .insert({
          period,
          status: items.length ? "scheduled" : "skipped",
          scheduled_for: next.toISOString(),
          items,
          error: items.length ? null : "No new article this month",
        })
        .select("*")
        .single();
      out.drafted = { period, items: items.length };
      if (issue && items.length) {
        // Preview to the admins, so they can read it and cancel in time.
        for (const to of await adminEmails(db)) {
          const tok = await unsubscribeTokenFor(db, to);
          if (!tok) continue;
          const r = await renderDigest(
            issue,
            "fr",
            `${SITE_URL}/unsubscribe?token=${tok}`,
          );
          await queueMarketingEmail(db, {
            to,
            subject: `[Aperçu] ${r.subject} — envoi le ${next.toLocaleDateString("fr-FR")}`,
            html: r.html,
            text: r.text,
            label: "newsletter-preview",
            idempotencyKey: `newsletter-preview:${issue.id}:${to}`,
            unsubscribeToken: tok,
          });
        }
      }
    }
  }

  // 2. Send what is due, a batch per run.
  const { data: due } = await db
    .from("newsletter_issues")
    .select("*")
    .in("status", ["scheduled", "sending"])
    .lte("scheduled_for", now.toISOString())
    .order("scheduled_for")
    .limit(1)
    .maybeSingle();
  if (due) out.sending = await sendBatch(db, due);
  return out;
}

async function sendBatch(db: SupabaseClient, issue: Record<string, any>) {
  if (issue.status === "scheduled") {
    const { count } = await db
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "subscribed");
    await db
      .from("newsletter_issues")
      .update({ status: "sending", recipients: count ?? 0 })
      .eq("id", issue.id);
  }
  const { data: done } = await db
    .from("newsletter_deliveries")
    .select("email")
    .eq("issue_id", issue.id);
  const skip = new Set((done ?? []).map((d) => d.email));
  const { data: subs } = await db
    .from("newsletter_subscribers")
    .select("email, locale")
    .eq("status", "subscribed")
    .order("created_at")
    .limit(BATCH + skip.size);
  const batch = (subs ?? []).filter((x) => !skip.has(x.email)).slice(0, BATCH);

  let queued = 0;
  const cache = new Map<
    string,
    { subject: string; html: string; text: string }
  >();
  for (const sub of batch) {
    const lang = langOf(sub.locale);
    const tok = await unsubscribeTokenFor(db, sub.email);
    let status = "suppressed";
    if (tok) {
      const unsub = `${SITE_URL}/unsubscribe?token=${tok}`;
      // The body differs per reader only by the unsubscribe link.
      const key = lang;
      if (!cache.has(key))
        cache.set(key, await renderDigest(issue, lang, "__UNSUB__"));
      const r = cache.get(key)!;
      status = await queueMarketingEmail(db, {
        to: sub.email,
        subject: r.subject,
        html: r.html.replaceAll("__UNSUB__", unsub),
        text: r.text.replaceAll("__UNSUB__", unsub),
        label: `newsletter-${issue.period}`,
        idempotencyKey: `newsletter:${issue.id}:${sub.email}`,
        unsubscribeToken: tok,
      });
      if (status === "queued") queued++;
    }
    await db
      .from("newsletter_deliveries")
      .insert({ issue_id: issue.id, email: sub.email, status });
  }
  const finished = batch.length < BATCH;
  await db
    .from("newsletter_issues")
    .update({
      sent: (issue.sent ?? 0) + queued,
      ...(finished
        ? { status: "sent", sent_at: new Date().toISOString() }
        : {}),
    })
    .eq("id", issue.id);
  return { queued, batch: batch.length, finished };
}

// --- Entry point -----------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  const url = Deno.env.get("SUPABASE_URL")!;
  const db = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const bearer = (req.headers.get("Authorization") ?? "").replace(
    /^Bearer\s+/i,
    "",
  );
  const { data: cronOk } = await db.rpc("cron_secret_ok", {
    p_name: "content_automation_cron_secret",
    p_token: bearer,
  });
  let isAdmin = false;
  if (!cronOk && bearer) {
    const { data: u } = await db.auth.getUser(bearer);
    if (u.user) {
      const { data } = await db.rpc("has_role", {
        _user_id: u.user.id,
        _role: "admin",
      });
      isAdmin = !!data;
    }
  }
  if (!cronOk && !isAdmin) return reply({ error: "Unauthorized" }, 401);

  const body = await req.json().catch(() => ({}));
  const action: string = isAdmin ? (body.action ?? "run") : "run";
  const { data: settings } = await db
    .from("automation_settings")
    .select("*")
    .maybeSingle();
  const s = settings as Settings;

  try {
    if (action === "status") {
      return reply({
        configured: Object.fromEntries(NETWORKS.map((n) => [n, configured(n)])),
      });
    }
    if (action === "preview" || action === "send_test") {
      const { data: issue } = await db
        .from("newsletter_issues")
        .select("*")
        .eq("id", body.issue_id)
        .single();
      const lang = langOf(body.lang ?? "fr");
      if (action === "preview") {
        const r = await renderDigest(issue, lang, `${SITE_URL}/unsubscribe`);
        return reply(r);
      }
      const to = String(body.email ?? "").toLowerCase();
      const tok = await unsubscribeTokenFor(db, to);
      if (!tok) return reply({ error: "This address unsubscribed" }, 400);
      const r = await renderDigest(
        issue,
        lang,
        `${SITE_URL}/unsubscribe?token=${tok}`,
      );
      const status = await queueMarketingEmail(db, {
        to,
        subject: `[Test] ${r.subject}`,
        html: r.html,
        text: r.text,
        label: "newsletter-test",
        idempotencyKey: `newsletter-test:${issue.id}:${to}:${Date.now()}`,
        unsubscribeToken: tok,
      });
      return reply({ status });
    }
    if (action === "publish_post") {
      const feed = await loadFeed();
      const { data: p } = await db
        .from("social_posts")
        .select("*")
        .eq("id", body.id)
        .single();
      const r = await publishOne(db, { ...p, attempts: 0 }, feed);
      const { data: after } = await db
        .from("social_posts")
        .select("status, error")
        .eq("id", body.id)
        .single();
      return reply({ result: r, ...after });
    }

    // Full run (cron, or "Run now" from the dashboard).
    const { data: run } = await db
      .from("automation_runs")
      .insert({ job: "content-automation" })
      .select("id")
      .single();
    let summary: Record<string, unknown> = {};
    let ok = true;
    try {
      const feed = await loadFeed();
      summary = {
        feed: feed.length,
        social: await syncSocial(db, feed, s),
        newsletter: await newsletter(db, feed, s),
      };
    } catch (e) {
      ok = false;
      summary = { error: String(e).slice(0, 500) };
    }
    await db
      .from("automation_runs")
      .update({ finished_at: new Date().toISOString(), ok, summary })
      .eq("id", run!.id);
    return reply({ ok, summary }, ok ? 200 : 500);
  } catch (e) {
    return reply({ error: String(e).slice(0, 500) }, 500);
  }
});
