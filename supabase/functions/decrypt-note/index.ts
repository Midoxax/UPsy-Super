// Decrypts a session note for its own psychologist. An admin may also, as
// break-glass access: only with a written reason, and every such read is
// recorded in audit_log (the same rule as admin_break_glass_read()).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

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

    const { note_id, reason } = await req.json();
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

    // Authorization: the note's own psychologist, or an admin giving a reason.
    if (note.psychologist_id !== user.id) {
      const { data: isAdmin } = await admin.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!isAdmin) return json({ error: "Forbidden" }, 403);
      const why = typeof reason === "string" ? reason.trim() : "";
      if (why.length < 15)
        return json(
          { error: "A reason of at least 15 characters is required" },
          400,
        );
      const { error: auditErr } = await admin.from("audit_log").insert({
        user_id: user.id,
        action: "break_glass.read",
        resource_type: "session_notes",
        resource_id: note_id,
        actor_role: "admin",
        data_class: "C1",
        record_ref: `session_notes:${note_id}`,
        metadata: { reason: why, via: "decrypt-note" },
      });
      // No audit row, no access.
      if (auditErr) throw auditErr;
    }

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
