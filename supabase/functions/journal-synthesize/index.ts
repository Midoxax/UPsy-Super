import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
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
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userMsg = [
      entry.title ? `Title: ${entry.title}` : null,
      entry.mood_tag ? `Mood tag: ${entry.mood_tag}` : null,
      `Entry:\n${entry.content}`,
    ].filter(Boolean).join("\n\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userMsg },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return new Response(JSON.stringify({ error: "AI error", detail: t.slice(0, 200) }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const json = await res.json();
    const raw = json?.choices?.[0]?.message?.content ?? "{}";
    let parsed: { summary?: string; themes?: string[] } = {};
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }
    const summary = (parsed.summary ?? "").toString().slice(0, 1200);
    const themes = Array.isArray(parsed.themes)
      ? Array.from(new Set(parsed.themes.map((t) => String(t).toLowerCase().trim()).filter(Boolean))).slice(0, 5)
      : [];

    const { error: updErr } = await supabase
      .from("journal_entries")
      .update({ ai_summary: summary, themes, synthesized_at: new Date().toISOString() })
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