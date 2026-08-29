// Crisis screening edge function.
// Uses lightweight CSSRS-style keyword screening + Lovable AI classifier
// to estimate risk level. NEVER stores user content.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createLogger } from "../_shared/logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HIGH_RISK_KEYWORDS = [
  "suicide", "kill myself", "end my life", "want to die", "self harm", "self-harm",
  "me suicider", "me tuer", "en finir", "mourir", "automutilation",
  "أنتحر", "أقتل نفسي",
];

const MODERATE_KEYWORDS = [
  "hopeless", "worthless", "no reason to live", "burden",
  "sans espoir", "fardeau", "désespéré",
];

type RiskLevel = "low" | "moderate" | "high";

function keywordScreen(text: string): RiskLevel {
  const lower = text.toLowerCase();
  if (HIGH_RISK_KEYWORDS.some((k) => lower.includes(k))) return "high";
  if (MODERATE_KEYWORDS.some((k) => lower.includes(k))) return "moderate";
  return "low";
}

async function aiClassify(text: string): Promise<RiskLevel> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return "low";

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content:
              "You are a clinical risk classifier. Respond with EXACTLY one word: 'high', 'moderate', or 'low'. " +
              "high = explicit suicidal ideation, intent or plan, or active self-harm. " +
              "moderate = hopelessness, worthlessness, passive death wish without intent. " +
              "low = sadness, stress, normal distress without ideation.",
          },
          { role: "user", content: text.slice(0, 2000) },
        ],
        temperature: 0,
        max_tokens: 4,
      }),
    });
    if (!res.ok) return "low";
    const json = await res.json();
    const out = (json.choices?.[0]?.message?.content || "").toLowerCase().trim();
    if (out.startsWith("high")) return "high";
    if (out.startsWith("moderate")) return "moderate";
    return "low";
  } catch {
    return "low";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const log = createLogger(req, "crisis-screening");

  try {
    // Per-user (if authed) + per-IP throttle. Crisis screening is invoked
    // automatically while typing — keep limits generous but bounded.
    const authHeader = req.headers.get("Authorization") ?? "";
    const ip = (req.headers.get("x-forwarded-for") ?? "")
      .split(",")[0]
      .trim() || "unknown";
    let userKey = "";
    try {
      const userClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data: { user } } = await userClient.auth.getUser();
      if (user) userKey = `crisis:user:${user.id}`;
    } catch (_) {
      /* anon */
    }
    const limiter = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!,
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
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } },
        );
      }
    }

    const { text } = await req.json();
    if (typeof text !== "string" || text.length < 3) {
      return new Response(JSON.stringify({ risk_level: "low" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const kw = keywordScreen(text);
    // Short-circuit: keyword 'high' is always high.
    if (kw === "high") {
      log.warn("high risk via keyword match");
      return new Response(JSON.stringify({ risk_level: "high", source: "keyword" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ai = await aiClassify(text);
    // Conservative max
    const order: Record<RiskLevel, number> = { low: 0, moderate: 1, high: 2 };
    const finalRisk: RiskLevel = order[ai] >= order[kw] ? ai : kw;

    if (finalRisk !== "low") log.info("risk detected", { level: finalRisk, source: "blended" });
    return new Response(JSON.stringify({ risk_level: finalRisk, source: "blended" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    log.error("unhandled error", e);
    return new Response(JSON.stringify({ risk_level: "low", error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
