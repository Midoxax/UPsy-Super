import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });

  // pg_cron sends the Vault secret ops_task_watcher_cron_secret
  // (20261027100000_ops_watcher_cron_secret.sql); nothing else may run this.
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const bearer = (req.headers.get("Authorization") ?? "").replace(
    /^Bearer\s+/i,
    "",
  );
  const { data: ok } = await admin.rpc("cron_secret_ok", {
    p_name: "ops_task_watcher_cron_secret",
    p_token: bearer,
  });
  if (!ok) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const nowIso = new Date().toISOString();

    // Find overdue tasks in non-terminal states
    const { data: overdue, error: selErr } = await admin
      .from("ops_tasks")
      .select("id, state, event_id")
      .lt("deadline", nowIso)
      .in("state", ["pending", "active", "blocked"]);
    if (selErr) throw selErr;

    const ids = (overdue ?? []).map((t) => t.id);
    if (ids.length === 0) {
      return new Response(JSON.stringify({ flipped: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updErr } = await admin
      .from("ops_tasks")
      .update({ state: "delayed", updated_at: nowIso })
      .in("id", ids);
    if (updErr) throw updErr;

    // Emit state-change events for audit / realtime
    const events = (overdue ?? []).map((t) => ({
      task_id: t.id,
      from_state: t.state,
      to_state: "delayed",
      note: "Auto-flipped by ops-task-watcher (deadline passed)",
    }));
    await admin.from("ops_task_events").insert(events);

    console.log(`ops-task-watcher: flipped ${ids.length} task(s) to delayed`);
    return new Response(JSON.stringify({ flipped: ids.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ops-task-watcher error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
