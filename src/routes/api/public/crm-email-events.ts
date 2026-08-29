// Provider callback for email engagement (delivered / opened / clicked /
// bounced) and inbound replies. Public prefix so the ESP can reach it — the
// bearer secret below is the actual security boundary.

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

type Body = {
  type?: string;
  event?: string;
  direction?: "outbound" | "inbound";
  email?: string;
  to?: string | string[];
  message_id?: string;
  subject?: string;
  preview?: string;
  campaign?: string;
  template?: string;
  data?: Record<string, unknown>;
};

const constantTimeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export const Route = createFileRoute("/api/public/crm-email-events")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["CRM_EMAIL_WEBHOOK_SECRET"];
        if (!secret) return new Response("Webhook not configured", { status: 503 });

        const provided = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
        if (!provided || !constantTimeEqual(provided, secret)) {
          return new Response("Unauthorized", { status: 401 });
        }

        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const nested = (body.data ?? {}) as Record<string, unknown>;
        const eventType = String(body.type ?? body.event ?? "").slice(0, 64);
        const email =
          body.email ??
          first(body.to) ??
          (typeof nested["email"] === "string" ? (nested["email"] as string) : undefined) ??
          first(nested["to"] as string | string[] | undefined);
        const messageId =
          body.message_id ??
          (typeof nested["email_id"] === "string" ? (nested["email_id"] as string) : undefined);

        if (!eventType || (!email && !messageId)) {
          return new Response("Missing event type or recipient", { status: 400 });
        }

        const admin = createClient(
          process.env["SUPABASE_URL"]!,
          process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
          { auth: { persistSession: false } }
        );

        // Inbound replies are logged as a message on the contact timeline.
        if (body.direction === "inbound" || eventType === "email.inbound") {
          const { error } = await admin.rpc("crm_log_email", {
            _email: email,
            _subject: body.subject ?? "Reply",
            _direction: "inbound",
            _provider_message_id: messageId ?? null,
            _campaign: body.campaign ?? null,
            _template: body.template ?? null,
            _preview: body.preview ?? null,
            _status: "received",
            _metadata: nested,
          } as never);
          if (error) return new Response("Failed to log inbound email", { status: 500 });
          return new Response(JSON.stringify({ ok: true, logged: "inbound" }), {
            headers: { "Content-Type": "application/json" },
          });
        }

        const { error } = await admin.rpc("crm_record_email_event", {
          _event_type: eventType,
          _email: email ?? null,
          _provider_message_id: messageId ?? null,
          _metadata: nested,
        } as never);
        if (error) return new Response("Failed to record event", { status: 500 });

        return new Response(JSON.stringify({ ok: true }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
