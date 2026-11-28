import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { buildPublishLinkEmail } from "../_shared/email-templates/accreditation/publishLink.ts";
import { preparePublication } from "../_shared/profile-publication.ts";
import { sender } from "../_shared/sender.ts";

/**
 * Admin: email an approved psychologist the one-click link that publishes
 * the profile prepared from their application. For accounts approved before
 * publish-on-approval existed, and for resends. POST {psychologistId}.
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);
  const asCaller = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });
  const { data: claims } = await asCaller.auth.getClaims(auth.slice(7));
  const callerId = claims?.claims?.sub as string | undefined;
  if (!callerId) return json({ error: "unauthorized" }, 401);

  const db = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });
  const { data: isAdmin } = await db
    .from("user_roles")
    .select("role")
    .eq("user_id", callerId)
    .eq("role", "admin")
    .maybeSingle();
  if (!isAdmin) return json({ error: "admin role required" }, 403);

  let psychologistId = "";
  try {
    psychologistId = String((await req.json()).psychologistId ?? "");
  } catch {
    /* handled below */
  }
  if (!/^[0-9a-f-]{36}$/i.test(psychologistId)) {
    return json({ error: "invalid psychologistId" }, 400);
  }

  const [{ data: profile }, { data: user }, { data: app }] = await Promise.all([
    db
      .from("psychologist_profiles")
      .select("full_name, is_published, is_accredited")
      .eq("id", psychologistId)
      .maybeSingle(),
    db.auth.admin.getUserById(psychologistId),
    db
      .from("psychologist_applications")
      .select("preferred_locale")
      .eq("user_id", psychologistId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  const email = user?.user?.email;
  if (!profile || !email) return json({ error: "no account" }, 404);
  if (profile.is_published) return json({ error: "already published" }, 409);
  if (!profile.is_accredited) return json({ error: "not accredited" }, 409);

  const locale = app?.preferred_locale ?? "fr";
  const publishUrl = await preparePublication(db, psychologistId, locale);
  if (!publishUrl) return json({ error: "could not prepare" }, 500);

  const { subject, html, text } = buildPublishLinkEmail({
    locale,
    fullName: profile.full_name,
    publishUrl,
  });
  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
  const { error } = await resend.emails.send({
    from: sender(),
    to: [email],
    subject,
    html,
    text,
  });
  if (error) return json({ error: "send failed" }, 502);
  return json({ sent: true });
});
