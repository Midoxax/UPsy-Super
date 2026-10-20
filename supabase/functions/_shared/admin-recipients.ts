import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Where admin alerts go: ADMIN_NOTIFY_EMAIL (comma-separated allowed), or
 * else every user holding the admin role. Never throws; returns [] when
 * nobody can be found.
 */
export async function adminRecipients(): Promise<string[]> {
  const configured = (Deno.env.get("ADMIN_NOTIFY_EMAIL") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (configured.length > 0) return configured;

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const { data: roles } = await admin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    const ids = (roles ?? []).map((r: { user_id: string }) => r.user_id);
    if (ids.length === 0) return [];
    const { data: users } = await admin
      .schema("auth")
      .from("users")
      .select("email")
      .in("id", ids);
    return (users ?? [])
      .map((u: { email: string | null }) => u.email)
      .filter((e: string | null): e is string => !!e);
  } catch (e) {
    console.warn("[admin-recipients] lookup failed", e);
    return [];
  }
}
