// CI events ingest — deploy lifecycle and security-scan findings land here.
// Bearer-secret protected (CI_WEBHOOK_SECRET), rate-limited per IP, and writes
// each event to app_logs via the service role so it surfaces in the admin
// Operations-log tab. Accepts a single event or a small batch.

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

type CiEvent = {
  event?: string;
  level?: string;
  message?: string;
  source?: string;
  environment?: string;
  release?: string;
  route?: string;
  status_code?: number;
  metadata?: Record<string, unknown>;
};

const constantTimeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
};

export const Route = createFileRoute("/api/public/ci-events")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["CI_WEBHOOK_SECRET"];
        const url = process.env["SUPABASE_URL"];
        const svcKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
        if (!secret || !url || !svcKey) return new Response("CI logging unavailable", { status: 503 });

        const provided = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
        if (!provided || !constantTimeEqual(provided, secret)) {
          return new Response("Unauthorized", { status: 401 });
        }

        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const items = Array.isArray(payload) ? payload : [payload];
        if (items.length > 25) return new Response("Batch too large", { status: 413 });

        const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "ci";
        const admin = createClient(url, svcKey, { auth: { persistSession: false } });

        const { data: allowed } = await admin.rpc("check_and_increment_rate_limit", {
          _key: `ci-events:${ip}`,
          _max: 60,
          _window_seconds: 3600,
        } as never);
        if (allowed === false) return new Response("Too many requests", { status: 429, headers: { "Retry-After": "60" } });

        for (const raw of items) {
          const item = (raw ?? {}) as CiEvent;
          await admin.rpc("log_app_event", {
            _event: item.event ?? "ci_event",
            _level: item.level ?? "info",
            _source: item.source ?? "deploy",
            _message: typeof item.message === "string" ? item.message.slice(0, 2000) : null,
            _environment: item.environment ?? "production",
            _release: item.release ?? null,
            _route: typeof item.route === "string" ? item.route.slice(0, 200) : null,
            _status_code: typeof item.status_code === "number" ? item.status_code : null,
            _metadata: item.metadata ?? {},
          } as never);
        }

        return new Response(JSON.stringify({ ok: true, logged: items.length }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
