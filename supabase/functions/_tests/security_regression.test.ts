// Security regression tests — RLS / PHI access for bookings, recommend,
// org pulse, and PHI tables across roles (client, specialist, business
// owner, hacker).
//
// These tests run against the live project. They require:
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_PUBLISHABLE_KEY
//   SUPABASE_SERVICE_ROLE_KEY  (optional — if absent the test is skipped)
//
// All test users are created with random emails and torn down at the end.

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const skipReason = !URL || !ANON || !SERVICE
  ? "missing env (URL / ANON / SERVICE_ROLE_KEY) — skipping security regression"
  : null;

async function makeUser(admin: SupabaseClient, label: string) {
  const email = `qa+${label}+${crypto.randomUUID()}@upsy.test`;
  const password = `Px-${crypto.randomUUID()}`;
  const { data, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (error) throw error;
  return { id: data.user!.id, email, password };
}

async function loginAs(email: string, password: string) {
  const c = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return c;
}

Deno.test({
  name: "security regression — RLS / PHI / token access",
  ignore: !!skipReason,
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const admin = createClient(URL, SERVICE!, { auth: { persistSession: false } });

    const clientA = await makeUser(admin, "clientA");
    const clientB = await makeUser(admin, "clientB");
    const specialist = await makeUser(admin, "psy");
    await admin.from("user_roles").insert({ user_id: specialist.id, role: "psychologist" });
    await admin.from("psychologist_profiles").insert({ id: specialist.id, full_name: "QA Psy" });

    // Seed a booking owned by clientA + specialist with a valid proposal token.
    const validToken = `qa-${crypto.randomUUID()}`;
    const expiredToken = `qa-${crypto.randomUUID()}`;
    const future = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    const past = new Date(Date.now() - 3600 * 1000).toISOString();

    const { data: bk1 } = await admin.from("bookings").insert({
      psychologist_id: specialist.id,
      patient_id: clientA.id,
      scheduled_at: future,
      duration_minutes: 50,
      session_type: "video",
      status: "proposed",
      proposal_token: validToken,
      proposal_expires_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    }).select().single();
    const { data: bk2 } = await admin.from("bookings").insert({
      psychologist_id: specialist.id,
      patient_id: clientA.id,
      scheduled_at: future,
      duration_minutes: 50,
      session_type: "video",
      status: "proposed",
      proposal_token: expiredToken,
      proposal_expires_at: past,
    }).select().single();

    // ---- 1. bookings RLS ----
    const aClient = await loginAs(clientA.email, clientA.password);
    const bClient = await loginAs(clientB.email, clientB.password);
    const psyClient = await loginAs(specialist.email, specialist.password);
    const anon = createClient(URL, ANON, { auth: { persistSession: false } });

    const { data: aBookings } = await aClient.from("bookings").select("id").eq("id", bk1!.id);
    assertEquals(aBookings?.length, 1, "client A should see own booking");

    const { data: bSeesA } = await bClient.from("bookings").select("id").eq("id", bk1!.id);
    assertEquals(bSeesA?.length, 0, "client B must not see client A's booking (RLS)");

    const { data: psySees } = await psyClient.from("bookings").select("id").eq("id", bk1!.id);
    assertEquals(psySees?.length, 1, "specialist should see own booking");

    const { data: anonSees } = await anon.from("bookings").select("id").eq("id", bk1!.id);
    assertEquals(anonSees?.length, 0, "anon must not read bookings directly");

    // ---- 2. get_booking_by_token RPC ----
    const { data: byValid } = await anon.rpc("get_booking_by_token", { _token: validToken });
    assertEquals(byValid?.length, 1, "valid token returns booking via RPC");

    const { data: byExpired } = await anon.rpc("get_booking_by_token", { _token: expiredToken });
    assertEquals(byExpired?.length, 0, "expired token returns nothing");

    const { data: byGarbage } = await anon.rpc("get_booking_by_token", { _token: "not-real" });
    assertEquals(byGarbage?.length, 0, "garbage token returns nothing");

    // ---- 3. PHI tables ----
    await admin.from("mood_entries").insert({ user_id: clientA.id, mood_score: 3 });
    await admin.from("journal_entries").insert({ user_id: clientA.id, content: "private" });

    const { data: bMood } = await bClient.from("mood_entries").select("id").eq("user_id", clientA.id);
    assertEquals(bMood?.length, 0, "client B cannot read client A's mood entries");
    const { data: bJournal } = await bClient.from("journal_entries").select("id").eq("user_id", clientA.id);
    assertEquals(bJournal?.length, 0, "client B cannot read client A's journal");

    // ---- 4. recommend edge function — anon falls back, never user-scoped ----
    const recRes = await fetch(`${URL}/functions/v1/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON },
      body: JSON.stringify({ user_id: clientA.id }), // hostile body field — must be ignored
    });
    const recBody = await recRes.json();
    assert(Array.isArray(recBody.recommendations), "recommend always returns an array");
    assertEquals(recBody.recommendations.length, 3, "fallback length");

    // ---- Cleanup ----
    await admin.from("bookings").delete().eq("psychologist_id", specialist.id);
    await admin.from("mood_entries").delete().eq("user_id", clientA.id);
    await admin.from("journal_entries").delete().eq("user_id", clientA.id);
    await admin.from("psychologist_profiles").delete().eq("id", specialist.id);
    await admin.from("user_roles").delete().eq("user_id", specialist.id);
    for (const u of [clientA, clientB, specialist]) {
      await admin.auth.admin.deleteUser(u.id);
    }
  },
});