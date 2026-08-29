// Minimal uptime probe for external monitors (UptimeRobot, Better Stack, …).
// Cheaper than /api/public/health and intentionally carries no detail: a 200
// here means the Worker answered, nothing more.

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/healthz")({
  server: {
    handlers: {
      GET: async () => new Response("ok", { status: 200, headers: { "Cache-Control": "no-store" } }),
    },
  },
});
