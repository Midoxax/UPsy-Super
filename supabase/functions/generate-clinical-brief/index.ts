import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = "Tu es un assistant clinique expert qui aide des psychologues cliniciens marocains a preparer leur premiere seance. Tu recois une anamnese (JSON) et produis un brief clinique en francais. REGLES: Ne pose JAMAIS de diagnostic, signale des patterns a explorer. Ne prescris JAMAIS de traitement, suggere des pistes d ouverture cliniques. Mentionne que le brief ne remplace pas le jugement clinique. Ton professionnel-clinique. Cite les scores PHQ-9, GAD-7, PSS-10 avec interpretation. Identifie les flags critiques en haut du brief. Suggere 3 pistes d ouverture cliniques. Respecte les sections Je prefere en parler en seance. Le psy travaille au Maroc (Stop Silence 0801 000 180, SAMU 141). FORMAT: Markdown structure, 800-1200 mots.";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    // Authenticate caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = userData.user.id;
    const { data: roles } = await userClient.from("user_roles").select("role").eq("user_id", callerId);
    const isAdmin = (roles ?? []).some((r: any) => r.role === "admin");

    const { intake_form_id } = await req.json();
    if (!intake_form_id) {
      return new Response(JSON.stringify({ error: "Missing intake_form_id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { data: intake, error: intakeErr } = await supabase.from("client_anamneses").select("*").eq("id", intake_form_id).single();
    if (intakeErr || !intake) {
      return new Response(JSON.stringify({ error: "Intake form not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    // Authorize: only the linked psychologist or admin may generate the brief
    if (!isAdmin && intake.psychologist_id !== callerId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", intake.client_id).maybeSingle();
    const clientName = profile?.full_name || "Client";
    const identity = intake.identity || {};
    const age = identity.date_of_birth ? Math.floor((Date.now() - new Date(identity.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000)) : null;
    const briefInput = {
      client: { name: clientName, age, gender: identity.gender, city: identity.city },
      motif: intake.presenting_complaint, history: intake.history_personal, medical_history: intake.history_family,
      scales: { phq9: { score: intake.phq9_score, severity: intake.phq9_severity }, gad7: { score: intake.gad7_score, severity: intake.gad7_severity }, pss10: { score: intake.pss10_score, severity: intake.pss10_severity } },
      clinical_flags: intake.clinical_flags || [], lifestyle: intake.lifestyle, relationships: intake.risk_screening, objectives: intake.objectives_consent || intake.goals,
    };
    const aiResponse = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + Deno.env.get("LOVABLE_API_KEY") },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: JSON.stringify(briefInput) }], max_tokens: 3000, temperature: 0.3 }),
    });
    if (!aiResponse.ok) { const e = await aiResponse.text(); console.error("AI error:", e); return new Response(JSON.stringify({ error: "AI generation failed" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
    const aiData = await aiResponse.json();
    const briefMarkdown = aiData.choices?.[0]?.message?.content || "";
    const tokensUsed = aiData.usage?.total_tokens || 0;
    const redFlags = (intake.clinical_flags || []) as string[];
    await supabase.from("intake_clinical_briefs").upsert({ intake_form_id, psychologist_id: intake.psychologist_id, brief_markdown: briefMarkdown, motif_synthesis: (intake.presenting_complaint as any)?.main_reason?.substring(0, 500) || null, scales_summary: briefInput.scales, red_flags: redFlags, key_history_points: [], treatment_suggestions: [], ai_model: "google/gemini-2.5-flash", generation_tokens_used: tokensUsed }, { onConflict: "intake_form_id" });
    await supabase.from("client_anamneses").update({ shared_with_psy_at: new Date().toISOString() }).eq("id", intake_form_id);
    if (intake.psychologist_id) {
      await supabase.from("notifications").insert({ user_id: intake.psychologist_id, type: "intake_completed", title: "Anamnese de " + clientName + " disponible", body: "Le brief clinique est pret.", action_url: "/dashboard/specialist", metadata: { intake_form_id, client_id: intake.client_id } });
    }
    return new Response(JSON.stringify({ success: true, tokens_used: tokensUsed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("generate-clinical-brief error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
