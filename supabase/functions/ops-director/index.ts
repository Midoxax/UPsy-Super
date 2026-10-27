import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { aiErrorResponse, aiText, type ChatMessage } from "../_shared/ai.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(
      SUPABASE_URL,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: authHeader } },
      },
    );
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user)
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    const { workspace_id, messages } = await req.json();
    if (!workspace_id || !Array.isArray(messages))
      throw new Error("workspace_id and messages required");

    // Fetch workspace context
    const { data: ws } = await userClient
      .from("ops_workspaces")
      .select("name, kind")
      .eq("id", workspace_id)
      .maybeSingle();
    const { data: events } = await userClient
      .from("ops_events")
      .select("title, event_type, status")
      .eq("workspace_id", workspace_id)
      .order("created_at", { ascending: false })
      .limit(10);

    const systemPrompt = `You are the UPSY OPS AI Operations Director for the "${ws?.name ?? "workspace"}" (${ws?.kind ?? "institution"}). You orchestrate institutional operations: SOPs, accountability, psychological safety, logistics. Be direct, tactical, and operational. Use plain language. When asked to generate or modify protocols, describe what would change rather than executing — execution happens via the SOP engine.\n\nRecent operations in this workspace:\n${(events ?? []).map((e: any) => `- ${e.title} (${e.event_type}, ${e.status})`).join("\n") || "(none)"}`;

    let reply: string;
    try {
      reply = await aiText({
        system: systemPrompt,
        messages: (messages as ChatMessage[]).slice(-30),
      });
    } catch (e) {
      return aiErrorResponse(e, corsHeaders);
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ops-director error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
