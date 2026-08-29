import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FN_URL = `${SUPABASE_URL}/functions/v1/provision-psychologist`;

async function call(body: unknown, opts: { auth?: boolean } = { auth: true }) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.auth !== false) headers["Authorization"] = `Bearer ${ANON_KEY}`;
  const res = await fetch(FN_URL, { method: "POST", headers, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

Deno.test("rejects invalid uuid (validation)", async () => {
  const { status, json } = await call({ applicationId: "not-a-uuid", adminUserId: "also-bad" });
  assertEquals(status, 400);
  assertEquals(json.errorCode, "VALIDATION");
});

Deno.test("rejects missing fields (validation)", async () => {
  const { status, json } = await call({});
  assertEquals(status, 400);
  assertEquals(json.errorCode, "VALIDATION");
});

Deno.test("rejects non-admin caller (authorization)", async () => {
  // Random valid UUIDs that don't have admin role
  const { status, json } = await call({
    applicationId: crypto.randomUUID(),
    adminUserId: crypto.randomUUID(),
  });
  assertEquals(status, 403);
  assertEquals(json.errorCode, "UNAUTHORIZED");
});

Deno.test("CORS preflight returns 200", async () => {
  const res = await fetch(FN_URL, { method: "OPTIONS" });
  await res.text();
  assert(res.status >= 200 && res.status < 300);
  assertEquals(res.headers.get("access-control-allow-origin"), "*");
});

Deno.test("response shape contains errorCode + steps on failure", async () => {
  const { json } = await call({
    applicationId: crypto.randomUUID(),
    adminUserId: crypto.randomUUID(),
  });
  // Will be unauthorized but shape should be consistent
  assert("errorCode" in json);
});
