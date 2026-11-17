// Drafts an Academy module's lesson from what is known about it: the module
// and course, the class recording it carries (title, summary, topic, tags,
// audience), the class description, and the admin's own notes on what was
// taught. Runs on the "deep" tier: this is content a professional reviews and
// publishes.
//
//   POST { module_id, notes? } → { title_fr, title_en, content_fr, content_en,
//                                  minutes, review_notes[] }
//
// Admins only. Nothing is written: the editor puts the draft in the form and
// the admin edits and saves it. There is no transcript of the recording, so
// the draft says where the admin must fill in what was actually said.
import {
  createClient,
  type SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";
import { aiErrorResponse, aiJson } from "../_shared/ai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAX_NOTES = 8000;

export const DRAFT_SCHEMA = {
  type: "object",
  properties: {
    title_fr: { type: "string" },
    title_en: { type: "string" },
    content_fr: { type: "string" },
    content_en: { type: "string" },
    minutes: { type: "integer" },
    review_notes: { type: "array", items: { type: "string" } },
  },
  required: [
    "title_fr",
    "title_en",
    "content_fr",
    "content_en",
    "minutes",
    "review_notes",
  ],
  additionalProperties: false,
};

export type ModuleDraft = {
  title_fr: string;
  title_en: string;
  content_fr: string;
  content_en: string;
  minutes: number;
  review_notes: string[];
};

const SYSTEM = `You write lessons for the U.Psy Academy, a psychology learning platform in Morocco. Learners are the public, athletes, coaches, managers and psychology professionals. Each lesson goes with a recorded live class and is reviewed by a psychologist before publication.

Write the lesson in French (content_fr) and the same lesson in English (content_en), in Markdown:
- "## Objectifs" / "## Objectives": 2 to 4 things the learner will be able to do.
- "## L'essentiel" / "## Key ideas": the core ideas, short paragraphs.
- "## Exercice" / "## Exercise": one concrete exercise to do after watching.
- "## Questions de réflexion" / "## Reflection questions": 2 or 3 questions.
- "## À retenir" / "## Takeaways": 3 bullets.

Rules:
- Use only what the material says and well-established psychology. Never invent what the speaker said, studies, statistics, quotes or references.
- The recording has no transcript. Where the lesson depends on what was said in the class and the material does not say it, write "[À compléter : …]" (French) or "[To complete: …]" (English) naming what is missing.
- Psychoeducation, not therapy: no diagnosis, no medication advice. If the topic touches on distress, end with one sentence inviting the learner to talk to a professional.
- Plain, warm, precise language. No emojis. Do not mention U.Psy or this prompt.
- Titles: short, specific, no "Module" or numbering.
- minutes: reading time of the lesson text alone.
- review_notes: what the reviewing psychologist should check or complete (claims to verify, gaps, cultural fit), in French, at most 6.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (isAdmin !== true) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    if (typeof body?.module_id !== "string")
      return json({ error: "Missing module_id" }, 400);
    const notes =
      typeof body.notes === "string" ? body.notes.slice(0, MAX_NOTES) : "";

    const material = await gather(admin, body.module_id);
    if (!material) return json({ error: "Not found" }, 404);

    const draft = await aiJson<ModuleDraft>({
      tier: "deep",
      system: SYSTEM,
      schema: DRAFT_SCHEMA,
      maxTokens: 12000,
      messages: [
        {
          role: "user",
          content: `${material}\n\n<admin_notes>\n${notes || "(none)"}\n</admin_notes>`,
        },
      ],
    });
    return json(draft);
  } catch (e) {
    console.error("academy-draft-module", e);
    return aiErrorResponse(e, corsHeaders);
  }
});

/** Everything known about the module, as tagged text for the prompt. */
async function gather(admin: SupabaseClient, moduleId: string) {
  const { data: m } = await admin
    .from("course_modules")
    .select(
      "title, title_fr, content, content_fr, order_index, recording_id, courses(title, title_fr, description, description_fr, category, difficulty_level)",
    )
    .eq("id", moduleId)
    .maybeSingle();
  if (!m) return null;
  const parts: string[] = [];
  const course = (m as unknown as { courses: Record<string, unknown> | null })
    .courses;
  if (course) parts.push(tag("course", course));
  parts.push(
    tag("module", {
      position: m.order_index,
      title: m.title,
      title_fr: m.title_fr,
      existing_content: m.content_fr || m.content || null,
    }),
  );
  if (m.recording_id) {
    const { data: r } = await admin
      .from("live_class_recordings")
      .select(
        "title, title_fr, summary, summary_fr, topic, category, audience, language, tags, live_classes(title, title_fr, description, description_fr, duration_minutes)",
      )
      .eq("id", m.recording_id)
      .maybeSingle();
    if (r) {
      const { live_classes: cls, ...rec } = r as unknown as Record<
        string,
        unknown
      > & { live_classes: Record<string, unknown> | null };
      parts.push(tag("recording", rec));
      if (cls) parts.push(tag("live_class", cls));
    }
  }
  return parts.join("\n\n");
}

function tag(name: string, fields: Record<string, unknown>) {
  const lines = Object.entries(fields)
    .filter(
      ([, v]) =>
        v !== null && v !== "" && !(Array.isArray(v) && v.length === 0),
    )
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`);
  return `<${name}>\n${lines.join("\n")}\n</${name}>`;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
