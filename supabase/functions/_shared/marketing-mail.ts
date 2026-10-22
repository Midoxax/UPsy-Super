// Queue a marketing email (newsletter, sign-up confirmation) through the same
// pipeline as transactional mail: suppression check (fail-closed), a
// per-address unsubscribe token, the send log, then the pgmq queue that
// process-email-queue drains into Resend with List-Unsubscribe headers.
//
// Deliberately not a template in send-transactional-email's registry: that
// endpoint takes any recipient, so a newsletter template there would let
// anyone mail branded content, with their own links, to anyone.
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { sender } from "./sender.ts";

const SENDER_DOMAIN = "notify.upsy.ma";

function token(): string {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

export type QueueResult = "queued" | "suppressed" | "failed";

/** The unsubscribe token for an address, created on first use. Null when the
 *  address already unsubscribed or the lookup failed. */
export async function unsubscribeTokenFor(
  db: SupabaseClient,
  email: string,
): Promise<string | null> {
  const e = email.toLowerCase();
  const { data, error } = await db
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", e)
    .maybeSingle();
  if (error) return null;
  if (data) return data.used_at ? null : data.token;
  await db
    .from("email_unsubscribe_tokens")
    .upsert(
      { token: token(), email: e },
      { onConflict: "email", ignoreDuplicates: true },
    );
  const { data: stored } = await db
    .from("email_unsubscribe_tokens")
    .select("token")
    .eq("email", e)
    .maybeSingle();
  return stored?.token ?? null;
}

export async function queueMarketingEmail(
  db: SupabaseClient,
  m: {
    to: string;
    subject: string;
    html: string;
    text: string;
    label: string;
    idempotencyKey: string;
    unsubscribeToken: string;
  },
): Promise<QueueResult> {
  const to = m.to.toLowerCase();
  const messageId = crypto.randomUUID();

  const { data: suppressed, error: supErr } = await db
    .from("suppressed_emails")
    .select("id")
    .eq("email", to)
    .maybeSingle();
  if (supErr) return "failed";
  if (suppressed) {
    await db.from("email_send_log").insert({
      message_id: messageId,
      template_name: m.label,
      recipient_email: to,
      status: "suppressed",
    });
    return "suppressed";
  }

  await db.from("email_send_log").insert({
    message_id: messageId,
    template_name: m.label,
    recipient_email: to,
    status: "pending",
  });
  const { error } = await db.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to,
      from: sender("newsletter"),
      sender_domain: SENDER_DOMAIN,
      subject: m.subject,
      html: m.html,
      text: m.text,
      purpose: "marketing",
      label: m.label,
      idempotency_key: m.idempotencyKey,
      unsubscribe_token: m.unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  });
  if (error) {
    await db.from("email_send_log").insert({
      message_id: messageId,
      template_name: m.label,
      recipient_email: to,
      status: "failed",
      error_message: "Failed to enqueue email",
    });
    return "failed";
  }
  return "queued";
}
