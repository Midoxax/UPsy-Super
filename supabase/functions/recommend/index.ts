// Recommendation engine — returns 3 personalized items based on the user's
// recent mood, assessment, and journal activity. Falls back to safe defaults.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Rec = {
  type: "exercise" | "article" | "course";
  title: string;
  description: string;
  href: string;
  reason?: string;
};

const FALLBACK: Rec[] = [
  { type: "exercise", title: "5-minute breathing reset", description: "Box breathing to lower stress on demand.", href: "/resources" },
  { type: "article", title: "Understanding anxiety", description: "What anxiety is and how to respond.", href: "/blog/understanding-anxiety" },
  { type: "course", title: "Mindfulness for beginners", description: "An 8-session foundation course.", href: "/blog/mindfulness-for-beginners" },
];

const LIBRARY = {
  lowMood: [
    { type: "article", title: "Understanding depression", description: "Recognizing low mood and what helps.", href: "/blog/understanding-depression", reason: "Based on recent mood" },
    { type: "exercise", title: "Behavioral activation walk", description: "10 minutes outside to shift state.", href: "/resources", reason: "Evidence-based first step" },
  ] as Rec[],
  highStress: [
    { type: "exercise", title: "4-7-8 breathing", description: "Activates the parasympathetic system.", href: "/resources", reason: "For elevated stress" },
    { type: "article", title: "Mental health at work", description: "Practical strategies to protect your week.", href: "/blog/mental-health-at-work", reason: "Workplace stress" },
  ] as Rec[],
  growth: [
    { type: "course", title: "Mindfulness for beginners", description: "Build a sustainable practice.", href: "/blog/mindfulness-for-beginners", reason: "Continue your growth" },
    { type: "article", title: "How to support a loved one", description: "Skills that benefit you both.", href: "/blog/how-to-support-a-loved-one" },
  ] as Rec[],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Authenticated only — derive user from JWT, never trust body user_id
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ recommendations: FALLBACK }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ recommendations: FALLBACK }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user_id = userData.user.id;

    const { data: moods } = await supabase
      .from("mood_entries")
      .select("mood_score, stress_level, recorded_at")
      .eq("user_id", user_id)
      .gte("recorded_at", new Date(Date.now() - 14 * 86400000).toISOString())
      .limit(30);

    const recs: Rec[] = [];
    if (moods && moods.length > 0) {
      const avgMood = moods.reduce((a, b) => a + b.mood_score, 0) / moods.length;
      const stressVals = moods.filter((m) => m.stress_level !== null).map((m) => m.stress_level as number);
      const avgStress = stressVals.length ? stressVals.reduce((a, b) => a + b, 0) / stressVals.length : 0;

      if (avgMood < 3) recs.push(...LIBRARY.lowMood);
      if (avgStress >= 4) recs.push(...LIBRARY.highStress);
      recs.push(...LIBRARY.growth);
    }

    const seen = new Set<string>();
    const unique = (recs.length ? recs : FALLBACK).filter((r) => {
      if (seen.has(r.href)) return false;
      seen.add(r.href);
      return true;
    }).slice(0, 3);

    return new Response(JSON.stringify({ recommendations: unique }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ recommendations: FALLBACK, error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
