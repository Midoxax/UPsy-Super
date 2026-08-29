// Decrypts a session note. Only the owning psychologist (or admin) may call this.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { note_id } = await req.json();
    if (!note_id || typeof note_id !== "string")
      return json({ error: "Missing note_id" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: note } = await admin
      .from("session_notes")
      .select("psychologist_id, encrypted_content, encryption_key_id, content")
      .eq("id", note_id)
      .maybeSingle();

    if (!note) return json({ error: "Not found" }, 404);

    // Authorization: owner or admin
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (note.psychologist_id !== user.id && !isAdmin)
      return json({ error: "Forbidden" }, 403);

    if (!note.encrypted_content) return json({ content: note.content });

    const { data: plaintext, error: decErr } = await admin.rpc("decrypt_text", {
      p_ciphertext: note.encrypted_content,
      p_key_id: note.encryption_key_id,
    });
    if (decErr) throw decErr;

    return json({ content: plaintext });
  } catch (e) {
    console.error("decrypt-note error:", e);
    return json({ error: "Decryption failed" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
