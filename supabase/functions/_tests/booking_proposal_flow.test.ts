// End-to-end booking proposal flow:
//   1. Specialist creates proposal with token + expiry.
//   2. Anon caller fetches via get_booking_by_token — expects the row.
//   3. Client accepts via respond_to_proposal — status flips to 'confirmed'.
//   4. Re-fetching with the (now cleared) token returns nothing.
//   5. Forced expiry returns nothing.

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const skip = !URL || !ANON || !SERVICE;

Deno.test({
  name: "booking proposal flow — token fetch / accept / expire",
  ignore: skip,
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const admin = createClient(URL, SERVICE!, { auth: { persistSession: false } });
    const anon = createClient(URL, ANON, { auth: { persistSession: false } });

    const psyEmail = `qa+psy+${crypto.randomUUID()}@upsy.test`;
    const cliEmail = `qa+cli+${crypto.randomUUID()}@upsy.test`;
    const password = "Px-" + crypto.randomUUID();
    const psy = await admin.auth.admin.createUser({ email: psyEmail, password, email_confirm: true });
    const cli = await admin.auth.admin.createUser({ email: cliEmail, password, email_confirm: true });
    await admin.from("user_roles").insert({ user_id: psy.data.user!.id, role: "psychologist" });
    await admin.from("psychologist_profiles").insert({ id: psy.data.user!.id, full_name: "QA Flow Psy" });

    const token = `qa-flow-${crypto.randomUUID()}`;
    const future = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    const { data: bk } = await admin.from("bookings").insert({
      psychologist_id: psy.data.user!.id,
      patient_id: cli.data.user!.id,
      scheduled_at: future,
      duration_minutes: 50,
      session_type: "video",
      status: "proposed",
      proposal_token: token,
      proposal_expires_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    }).select().single();

    // 1. anon fetch via RPC
    const { data: row } = await anon.rpc("get_booking_by_token", { _token: token });
    assertEquals(row?.length, 1, "anon should retrieve proposal via RPC");
    assertEquals(row![0].status, "proposed");

    // 2. accept
    const { data: accept } = await anon.rpc("respond_to_proposal", {
      _token: token, _action: "accept",
    });
    assert(accept?.ok, "accept should succeed");
    assertEquals(accept?.status, "confirmed");

    // 3. token cleared after accept
    const { data: afterAccept } = await anon.rpc("get_booking_by_token", { _token: token });
    assertEquals(afterAccept?.length, 0, "token must not work after accept");

    // 4. force expiry on a fresh proposal
    const expToken = `qa-exp-${crypto.randomUUID()}`;
    await admin.from("bookings").insert({
      psychologist_id: psy.data.user!.id,
      patient_id: cli.data.user!.id,
      scheduled_at: future,
      duration_minutes: 50,
      session_type: "video",
      status: "proposed",
      proposal_token: expToken,
      proposal_expires_at: new Date(Date.now() - 60_000).toISOString(),
    });
    const { data: expRow } = await anon.rpc("get_booking_by_token", { _token: expToken });
    assertEquals(expRow?.length, 0, "expired token must return nothing");

    // cleanup
    await admin.from("bookings").delete().eq("id", bk!.id);
    await admin.from("bookings").delete().eq("proposal_token", expToken);
    await admin.from("psychologist_profiles").delete().eq("id", psy.data.user!.id);
    await admin.from("user_roles").delete().eq("user_id", psy.data.user!.id);
    await admin.auth.admin.deleteUser(psy.data.user!.id);
    await admin.auth.admin.deleteUser(cli.data.user!.id);
  },
});