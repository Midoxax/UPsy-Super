import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { aiErrorResponse, aiJson } from "../_shared/ai.ts";

const REFLECTION_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    themes: { type: "array", items: { type: "string" } },
  },
  required: ["summary", "themes"],
  additionalProperties: false,
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You synthesize a personal journal entry for the author.
Return STRICT JSON only, no prose, matching this shape:
{"summary": string, "themes": string[]}

Rules:
- "summary": 2-4 short reflective sentences in the SAME language as the entry. Compassionate, non-clinical, second person ("you"). Mirror what the writer expressed; do not invent facts. No advice unless the entry explicitly asks.
- "themes": 2-5 lowercase keywords (e.g. ["stress","sleep","focus","recovery"]). Single or two-word tags. No hashtags, no duplicates.
- Never diagnose, never reference clinical conditions by name unless the entry uses them.`;

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { entry_id } = await req.json();
    if (!entry_id || typeof entry_id !== "string") {
      return new Response(JSON.stringify({ error: "entry_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: entry, error: entryErr } = await supabase
      .from("journal_entries")
      .select("id, title, content, mood_tag, user_id")
      .eq("id", entry_id)
      .maybeSingle();
    if (entryErr || !entry || entry.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userMsg = [
      entry.title ? `Title: ${entry.title}` : null,
      entry.mood_tag ? `Mood tag: ${entry.mood_tag}` : null,
      `Entry:\n${entry.content}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    let parsed: { summary?: string; themes?: string[] } = {};
    try {
      parsed = await aiJson<{ summary: string; themes: string[] }>({
        system: SYSTEM,
        messages: [{ role: "user", content: userMsg }],
        schema: REFLECTION_SCHEMA,
        effort: "low",
      });
    } catch (e) {
      return aiErrorResponse(e, corsHeaders);
    }
    const summary = (parsed.summary ?? "").toString().slice(0, 1200);
    const themes = Array.isArray(parsed.themes)
      ? Array.from(
          new Set(
            parsed.themes
              .map((t) => String(t).toLowerCase().trim())
              .filter(Boolean),
          ),
        ).slice(0, 5)
      : [];

    const { error: updErr } = await supabase
      .from("journal_entries")
      .update({
        ai_summary: summary,
        themes,
        synthesized_at: new Date().toISOString(),
      })
      .eq("id", entry.id);
    if (updErr) {
      return new Response(JSON.stringify({ error: updErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ summary, themes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
