/**
 * Who platform email comes from.
 *
 * WHY THIS EXISTS
 *
 * Ten of the thirteen mail-sending functions sent from
 * `onboarding@resend.dev`. That is Resend's shared sandbox sender, and Resend
 * will only deliver from it to the address that owns the Resend account.
 * Every message to an actual patient or psychologist was therefore rejected —
 * including the session video link and the appointment reminders. Nothing
 * surfaced it: the function returns, the log looks ordinary, and the person
 * simply never receives anything. A no-show gets read as a no-show.
 *
 * The senders that were not sandboxed had their own problems. Authentication
 * email — password resets, address confirmations — went out branded
 * `upsydot-frontend-kit`, a scaffold placeholder, and session proposals went
 * out as `My Personal Psychologist`, a different product's name. On a clinical
 * platform the From line is the first trust signal a patient sees, and a
 * stranger's name on a password reset is indistinguishable from phishing.
 *
 * THE RULE
 *
 * Sender identity is configuration, not a literal repeated in thirteen files.
 * It resolves here, once.
 *
 * FAILING LOUDLY IS THE POINT
 *
 * There is deliberately no fallback to a sandbox domain. If the domain is not
 * verified in Resend, sending now fails with an error that reaches the logs
 * and Sentry, rather than succeeding into a void. A visible failure is worth
 * far more than a silent one when the message is "your session starts in an
 * hour".
 *
 * DNS REQUIRED BEFORE THIS DELIVERS
 *
 * The domain below must be verified in Resend — its own DKIM records, plus its
 * SPF include merged into the single existing SPF TXT record. Two SPF records
 * is a permanent error that fails all mail for the domain, Google Workspace
 * included. See the email section of DEPLOYMENT.md.
 */

/** Domain all platform mail is sent from. Must be verified in Resend. */
const FROM_DOMAIN = Deno.env.get("MAIL_FROM_DOMAIN") ?? "upsy.ma";

/** Display name on the From line. The first trust signal a patient sees. */
const FROM_NAME = Deno.env.get("MAIL_FROM_NAME") ?? "U.Psy";

/**
 * Mailbox per purpose, so recipients can filter and so a future dedicated
 * sending subdomain can be split off without touching call sites.
 */
export type SenderKind =
  /** Transactional notifications: bookings, reminders, meeting links. */
  | "notifications"
  /** Authentication: password resets, address confirmation. */
  | "auth"
  /** Documents generated for a user, e.g. certificates. */
  | "documents";

const MAILBOX: Record<SenderKind, string> = {
  notifications: "notifications",
  auth: "noreply",
  documents: "certificates",
};

/**
 * A complete RFC 5322 From value.
 *
 * @example sender("notifications") // 'U.Psy <notifications@upsy.ma>'
 */
export function sender(kind: SenderKind = "notifications"): string {
  return `${FROM_NAME} <${MAILBOX[kind]}@${FROM_DOMAIN}>`;
}

/** The bare address, for reply-to or envelope use. */
export function senderAddress(kind: SenderKind = "notifications"): string {
  return `${MAILBOX[kind]}@${FROM_DOMAIN}`;
}
