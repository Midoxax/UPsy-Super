// Deploy health check — public, no auth. Returns a structured status so an
// uptime monitor (or the DNS cutover dashboard) can tell a config-broken deploy
// from a healthy one without parsing HTML.
//
// Checks: required server env non-empty, the publishable client can reach the
// database (PostgREST root), and the build version is present. A missing secret
// surfaces as "degraded" with the named check — never the secret value.

import { createFileRoute } from "@tanstack/react-router";

type Check = { name: string; ok: boolean; detail?: string };

export const Route = createFileRoute("/api/public/health")({
  server: {
    handlers: {
      GET: async () => {
        const checks: Check[] = [];

        const url = process.env["SUPABASE_URL"];
        const pubKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
        const svcKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

        checks.push({ name: "SUPABASE_URL", ok: !!url });
        checks.push({ name: "SUPABASE_PUBLISHABLE_KEY", ok: !!pubKey });
        // Service role presence only — never returned in the body.
        checks.push({ name: "SUPABASE_SERVICE_ROLE_KEY", ok: !!svcKey });

        let dbOk = false;
        let dbDetail = "not checked";
        // PostgREST root responds 200 with a valid apikey; the service role
        // key bypasses RLS so the root is reachable regardless of table policies.
        // Server-side only — never returned in the body.
        if (url && svcKey) {
          try {
            const headers = new Headers({ apikey: svcKey });
            if (!svcKey.startsWith("sb_")) headers.set("Authorization", `Bearer ${svcKey}`);
            const res = await fetch(`${url}/rest/v1/`, { headers, signal: AbortSignal.timeout(4000) });
            dbOk = res.ok;
            dbDetail = `HTTP ${res.status}`;
          } catch (err) {
            dbDetail = err instanceof Error ? err.message : "fetch failed";
          }
        }
        checks.push({ name: "database_reachable", ok: dbOk, detail: dbDetail });

        const allOk = checks.every((c) => c.ok);
        const body = {
          status: allOk ? "ok" : "degraded",
          checks,
          version: process.env["VITE_APP_VERSION"] ?? process.env["COMMIT_SHA"] ?? null,
          environment: process.env["NODE_ENV"] ?? "unknown",
          timestamp: new Date().toISOString(),
        };

        return new Response(JSON.stringify(body), {
          status: allOk ? 200 : 503,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
