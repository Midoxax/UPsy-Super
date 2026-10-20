// Admin-only: invites a person by email (Supabase sends the invite through the
// auth email hook) and optionally gives them a non-admin role. Admins are
// still promoted from the user management panel once they have signed up.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SITE_URL } from "../_shared/site.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Roles an invite may grant. "client" is the app's "user" role. */
const ROLE_ALLOW_LIST: Record<string, string> = {
  client: "user",
  user: "user",
  psychologist: "psychologist",
  organization: "organization",
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

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || email.length > 255 || !EMAIL_REGEX.test(email))
      return json({ error: "A valid email is required" }, 400);

    let role: string | null = null;
    if (body?.role !== undefined && body?.role !== null && body?.role !== "") {
      role = ROLE_ALLOW_LIST[String(body.role)] ?? null;
      if (!role) return json({ error: "Role not allowed" }, 400);
    }

    const { data: invited, error: inviteErr } =
      await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${SITE_URL}/auth`,
      });
    if (inviteErr || !invited?.user) {
      console.warn("[admin-invite-user] invite failed", inviteErr?.message);
      const exists = /already|registered|exists/i.test(
        inviteErr?.message ?? "",
      );
      return json(
        {
          error: exists
            ? "This email already has an account"
            : "Could not send the invitation",
        },
        exists ? 409 : 500,
      );
    }

    if (role) {
      const { error: roleErr } = await admin
        .from("user_roles")
        .upsert(
          { user_id: invited.user.id, role },
          { onConflict: "user_id,role", ignoreDuplicates: true },
        );
      if (roleErr) {
        console.warn("[admin-invite-user] role assign failed", roleErr);
        return json({ ok: true, userId: invited.user.id, roleAssigned: false });
      }
    }

    return json({ ok: true, userId: invited.user.id, roleAssigned: !!role });
  } catch (e) {
    console.error("admin-invite-user error:", e);
    return json({ error: "Could not send the invitation" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
