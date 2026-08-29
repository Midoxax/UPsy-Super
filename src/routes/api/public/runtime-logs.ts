// Client-side runtime error ingest. Browsers POST batches of errors here; the
// endpoint rate-limits per IP and writes each to app_logs via the service role
// (app_logs is not directly writable from anon). No PII is accepted — the
// payload is a message + optional stack + route, never user data.
//
// Security: rate-limited via the existing check_and_increment_rate_limit RPC;
// no shared secret (errors must be loggable from any page), but the schema is
// strict and the batch is capped.

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

type ErrorItem = {
  message?: string;
  level?: string;
  stack?: string;
  route?: string;
  status_code?: number;
  metadata?: Record<string, unknown>;
};

export const Route = createFileRoute("/api/public/runtime-logs")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = process.env["SUPABASE_URL"];
        const svcKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
        if (!url || !svcKey) return new Response("Logging unavailable", { status: 503 });

        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const items = Array.isArray(payload) ? payload : [payload];
        if (items.length > 10) return new Response("Batch too large", { status: 413 });

        const ip =
          (request.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";

        const admin = createClient(url, svcKey, { auth: { persistSession: false } });

        // 20 error reports per IP per hour — enough for a real user hitting a
        // broken route, not enough for a flood to fill the log.
        const { data: allowed } = await admin.rpc("check_and_increment_rate_limit", {
          _key: `runtime-logs:ip:${ip}`,
          _max: 20,
          _window_seconds: 3600,
        } as never);
        if (allowed === false) return new Response("Too many requests", { status: 429, headers: { "Retry-After": "60" } });

        const release = request.headers.get("x-app-version") ?? null;
        const env = process.env["NODE_ENV"] ?? "production";

        for (const raw of items) {
          const item = (raw ?? {}) as ErrorItem;
          const message = typeof item.message === "string" ? item.message.slice(0, 2000) : "client_error";
          await admin.rpc("log_app_event", {
            _event: "client_error",
            _level: item.level === "error" ? "error" : "warn",
            _source: "client",
            _message: message,
            _environment: env,
            _release: release,
            _route: typeof item.route === "string" ? item.route.slice(0, 200) : null,
            _status_code: typeof item.status_code === "number" ? item.status_code : null,
            _metadata: {
              stack: typeof item.stack === "string" ? item.stack.slice(0, 4000) : null,
              ...(item.metadata ?? {}),
            },
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
