// Encrypts session note content using pgsodium with the calling psychologist's vault key.
// The key is auto-provisioned on first call.
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

    const { content, session_id, note_type, is_private } = await req.json();
    if (!content || !session_id) return json({ error: "Missing fields" }, 400);
    if (typeof content !== "string" || content.length > 50000)
      return json({ error: "Invalid content" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get or create per-psychologist key reference
    let { data: keyRow } = await admin
      .from("psychologist_encryption_keys")
      .select("vault_secret_id")
      .eq("psychologist_id", user.id)
      .maybeSingle();

    if (!keyRow) {
      // Create a new pgsodium key in vault
      const { data: newKey, error: keyErr } = await admin.rpc(
        "create_psychologist_key",
        { p_psychologist_id: user.id },
      );
      if (keyErr) throw keyErr;
      keyRow = { vault_secret_id: newKey };
    }

    // Encrypt via SQL RPC (pgsodium aead)
    const { data: encrypted, error: encErr } = await admin.rpc("encrypt_text", {
      p_plaintext: content,
      p_key_id: keyRow.vault_secret_id,
    });
    if (encErr) throw encErr;

    // Insert note
    const { data: note, error: insertErr } = await admin
      .from("session_notes")
      .insert({
        session_id,
        psychologist_id: user.id,
        content: "[encrypted]",
        encrypted_content: encrypted,
        encryption_key_id: keyRow.vault_secret_id,
        note_type: note_type ?? "progress",
        is_private: is_private ?? true,
      })
      .select()
      .single();
    if (insertErr) throw insertErr;

    return json({ id: note.id });
  } catch (e) {
    console.error("encrypt-note error:", e);
    return json({ error: "Encryption failed" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
