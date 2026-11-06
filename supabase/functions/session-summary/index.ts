import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { aiErrorResponse, aiJson } from "../_shared/ai.ts";
import { hasAiConsent, consentMissing } from "../_shared/ai-consent.ts";

const SUMMARY_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    themes: { type: "array", items: { type: "string" } },
    interventions: { type: "array", items: { type: "string" } },
    progress: { type: "string" },
    next_steps: { type: "array", items: { type: "string" } },
    risk_flags: { type: "array", items: { type: "string" } },
  },
  required: [
    "summary",
    "themes",
    "interventions",
    "progress",
    "next_steps",
    "risk_flags",
  ],
  additionalProperties: false,
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a clinical writing assistant for licensed psychologists.
Given raw session notes (often shorthand), produce a concise, professional summary in the same language as the input (English, French, or Arabic).

Output strict JSON with these keys:
- summary: 3-5 sentence narrative of the session
- themes: array of 3-6 short clinical themes (strings)
- interventions: array of techniques used (strings)
- progress: 1 sentence on observed progress
- next_steps: array of 2-4 suggested next steps
- risk_flags: array of any safety/risk indicators noted (empty if none)

Rules:
- Never invent facts. If the notes are sparse, say so in the summary.
- Use professional clinical tone, no diagnoses unless explicitly written.
- Keep PHI minimal — refer to "the client" rather than names.`;

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
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
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify psychologist role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const isPsy = (roles ?? []).some(
      (r: any) => r.role === "psychologist" || r.role === "admin",
    );
    if (!isPsy) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // The note is read with the caller's own token, so row-level security
    // limits it to the specialist's own notes; its session names the client
    // whose consent decides.
    const { note_id } = await req.json();
    if (!note_id || typeof note_id !== "string") {
      return new Response(JSON.stringify({ error: "note_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: note } = await supabase
      .from("session_notes")
      .select("content, session:sessions(client_id)")
      .eq("id", note_id)
      .maybeSingle();
    const clientId = (note?.session as { client_id?: string } | null)
      ?.client_id;
    if (!note || !clientId) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!(await hasAiConsent(clientId)))
      return consentMissing("client", corsHeaders);
    const notes = String(note.content ?? "");
    if (notes.trim().length < 10) {
      return new Response(JSON.stringify({ error: "Notes too short" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let summary: Record<string, unknown>;
    try {
      summary = await aiJson<Record<string, unknown>>({
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: notes.slice(0, 8000) }],
        schema: SUMMARY_SCHEMA,
      });
    } catch (e) {
      return aiErrorResponse(e, corsHeaders);
    }
    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("session-summary error:", e);
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
