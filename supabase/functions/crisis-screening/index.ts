// Crisis screening edge function.
// Keyword screening only (FR/EN/AR/Darija), run here: the text never leaves
// our infrastructure and is never stored. An AI classifier used to refine
// the result, but it sent health-related text to a US provider, which
// Law 09-08 treats as a transfer of sensitive data; keywords alone keep the
// screen local and always answer.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createLogger } from "../_shared/logger.ts";
import { keywordScreen } from "../_shared/crisis-screening.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  const log = createLogger(req, "crisis-screening");

  try {
    // Per-user (if authed) + per-IP throttle. Crisis screening is invoked
    // automatically while typing — keep limits generous but bounded.
    const authHeader = req.headers.get("Authorization") ?? "";
    const ip =
      (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
      "unknown";
    let userKey = "";
    try {
      const userClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const {
        data: { user },
      } = await userClient.auth.getUser();
      if (user) userKey = `crisis:user:${user.id}`;
    } catch (_) {
      /* anon */
    }
    const limiter = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
        Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    for (const [key, max, win] of [
      [userKey || `crisis:anon:${ip}`, 30, 300] as const,
      [`crisis:ip:${ip}`, 60, 300] as const,
    ]) {
      if (!key) continue;
      const { data: allowed } = await limiter.rpc(
        "check_and_increment_rate_limit",
        { _key: key, _max: max, _window_seconds: win },
      );
      if (allowed === false) {
        return new Response(
          JSON.stringify({ risk_level: "low", error: "rate_limited" }),
          {
            status: 429,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
              "Retry-After": "60",
            },
          },
        );
      }
    }

    const { text } = await req.json();
    if (typeof text !== "string" || text.length < 3) {
      return new Response(JSON.stringify({ risk_level: "low" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const risk = keywordScreen(text);
    if (risk !== "low") log.info("risk detected", { level: risk });
    return new Response(
      JSON.stringify({ risk_level: risk, source: "keyword" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    log.error("unhandled error", e);
    return new Response(
      JSON.stringify({
        risk_level: "unavailable",
        error: "screening_unavailable",
      }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
