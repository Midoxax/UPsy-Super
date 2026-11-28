import { createClient } from "npm:@supabase/supabase-js@2";
import {
  queueMarketingEmail,
  unsubscribeTokenFor,
} from "../_shared/marketing-mail.ts";
import {
  type FeeRow,
  type Flags,
  LANG_CODES,
  LANGS,
  nextStep,
  normaliseLang,
  renderNurture,
  SEQUENCES,
  type SequenceId,
  sendLang,
} from "../_shared/nurture/index.ts";
import { SITE_URL } from "../_shared/site.ts";

/**
 * Sends the follow-up sequences (20261126120000_nurture_sequences.sql):
 * every email that is due, through the marketing pipeline (suppression list,
 * unsubscribe link, send log, queue). A recipient who reached the goal
 * (applied, booked) gets no further email; one who unsubscribed is stopped.
 *
 * Run by pg_cron every 15 minutes with the Vault secret
 * nurture_emails_cron_secret; nothing else may call it.
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BATCH = 50;
const MAX_ATTEMPTS = 3;
const HOUR = 3600 * 1000;

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), {
    status,
    headers: { "Content-Type": "application/json" },
  });

interface Due {
  id: string;
  sequence: SequenceId;
  email: string;
  full_name: string | null;
  lang: string;
  step: number;
  attempts: number;
  sent_count: number;
  flags: Flags;
}

Deno.serve(async (req) => {
  const db = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });
  const bearer = (req.headers.get("Authorization") ?? "").replace(
    /^Bearer\s+/i,
    "",
  );
  const { data: ok } = await db.rpc("cron_secret_ok", {
    p_name: "nurture_emails_cron_secret",
    p_token: bearer,
  });
  if (!ok) return json({ error: "Unauthorized" }, 401);

  const { data, error } = await db.rpc("nurture_due", { p_limit: BATCH });
  if (error) return json({ error: error.message }, 500);
  const rows = (data ?? []) as Due[];

  let fees: FeeRow[] | undefined;
  if (rows.some((r) => r.sequence === "lsspm")) {
    const { data: plans } = await db
      .from("league_membership_plans")
      .select("label_fr, label_en, label_ar, amount_mad")
      .eq("is_active", true)
      .eq("self_service", true)
      .order("position");
    fees = (plans ?? []) as FeeRow[];
  }

  const update = (id: string, patch: Record<string, unknown>) =>
    db.from("nurture_enrolments").update(patch).eq("id", id);

  const tally = { sent: 0, converted: 0, completed: 0, stopped: 0, failed: 0 };

  for (const r of rows) {
    const seq = SEQUENCES[r.sequence];
    if (!seq) {
      await update(r.id, { status: "stopped", last_error: "unknown sequence" });
      tally.stopped++;
      continue;
    }
    const flags = r.flags ?? {};
    if (seq.convertedIf?.(flags)) {
      await update(r.id, { status: "converted" });
      tally.converted++;
      continue;
    }
    const step = nextStep(seq, r.step, flags);
    if (step === null) {
      await update(r.id, { status: "completed" });
      tally.completed++;
      continue;
    }

    const token = await unsubscribeTokenFor(db, r.email);
    if (!token) {
      // Unsubscribed (or the token lookup failed: try again next run).
      const { data: t } = await db
        .from("email_unsubscribe_tokens")
        .select("used_at")
        .eq("email", r.email)
        .maybeSingle();
      if (t?.used_at) {
        await update(r.id, { status: "stopped", last_error: "unsubscribed" });
        tally.stopped++;
      }
      continue;
    }

    const lang = sendLang(normaliseLang(r.lang));
    const fn = `${SUPABASE_URL}/functions/v1/email-language`;
    const languageLinks = LANG_CODES.filter((l) => LANGS[l].reviewed).map(
      (l) => ({ lang: l, url: `${fn}?t=${token}&l=${l}` }),
    );
    const email = renderNurture({
      seq,
      step,
      lang,
      fullName: r.full_name,
      unsubscribeUrl: `${SITE_URL}/unsubscribe?token=${token}`,
      languageLinks,
      fees,
    });

    const result = await queueMarketingEmail(db, {
      to: r.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      label: `nurture_${seq.id}_${step + 1}`,
      idempotencyKey: `nurture-${r.id}-${step}`,
      unsubscribeToken: token,
    });

    if (result === "queued") {
      const next = step + 1;
      const done = next >= seq.steps.length;
      await update(r.id, {
        step: next,
        status: done ? "completed" : "active",
        next_at: new Date(
          Date.now() + (done ? 0 : seq.steps[next].delayHours * HOUR),
        ).toISOString(),
        sent_count: (r.sent_count ?? 0) + 1,
        attempts: 0,
        last_sent_at: new Date().toISOString(),
        last_error: null,
      });
      tally.sent++;
    } else if (result === "suppressed") {
      await update(r.id, { status: "stopped", last_error: "suppressed" });
      tally.stopped++;
    } else {
      const attempts = r.attempts + 1;
      await update(r.id, {
        attempts,
        status: attempts >= MAX_ATTEMPTS ? "stopped" : "active",
        next_at: new Date(Date.now() + HOUR).toISOString(),
        last_error: "queue failed",
      });
      tally.failed++;
    }
  }

  return json({ due: rows.length, ...tally });
});
