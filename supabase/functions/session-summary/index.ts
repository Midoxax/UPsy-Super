import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify psychologist role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const isPsy = (roles ?? []).some((r: any) => r.role === "psychologist" || r.role === "admin");
    if (!isPsy) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { notes } = await req.json();
    if (!notes || typeof notes !== "string" || notes.trim().length < 10) {
      return new Response(JSON.stringify({ error: "Notes too short" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: notes.slice(0, 8000) },
        ],
        tools: [{
          type: "function",
          function: {
            name: "emit_summary",
            description: "Emit the structured session summary",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string" },
                themes: { type: "array", items: { type: "string" } },
                interventions: { type: "array", items: { type: "string" } },
                progress: { type: "string" },
                next_steps: { type: "array", items: { type: "string" } },
                risk_flags: { type: "array", items: { type: "string" } },
              },
              required: ["summary", "themes", "interventions", "progress", "next_steps", "risk_flags"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "emit_summary" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit. Retry shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "Malformed AI response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const summary = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("session-summary error:", e);
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
