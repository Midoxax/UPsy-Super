// Academy live classes.
//
//   { action: "join", class_id }            → room config + attendance id
//   { action: "heartbeat", attendance_id }  → keeps attendance current
//   { action: "recording_url", recording_id } → 1-hour signed URL
//
// Only the host, admins and registered participants can join, from 10
// minutes before the start (30 for the host) until 15 minutes after the end.
// The host joins as moderator. Recording is offered to the host only, and
// only for classes marked as recorded (educational content; participants
// consented at registration). Clinical sessions use jaas-token, which never
// allows recording.
//
// Secrets: JAAS_APP_ID, JAAS_KEY_ID, JAAS_PRIVATE_KEY (as jaas-token).
// Without them the page falls back to a public Jitsi room, not recorded.
import {
  createClient,
  type SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const EARLY_S = 10 * 60;
const HOST_EARLY_S = 30 * 60;
const LATE_S = 15 * 60;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    if (action === "join") return await join(admin, user, body.class_id);
    if (action === "heartbeat")
      return await heartbeat(admin, user.id, body.attendance_id);
    if (action === "recording_url")
      return await recordingUrl(userClient, admin, body.recording_id);
    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("live-class", e);
    return json({ error: "Something went wrong" }, 500);
  }
});

type Admin = SupabaseClient;
type User = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

async function join(admin: Admin, user: User, classId: unknown) {
  if (typeof classId !== "string")
    return json({ error: "Missing class_id" }, 400);
  const { data: c } = await admin
    .from("live_classes")
    .select(
      "id, host_id, starts_at, duration_minutes, status, room_name, recording_enabled",
    )
    .eq("id", classId)
    .maybeSingle();
  if (!c) return json({ error: "Not found" }, 404);
  if (c.status !== "scheduled")
    return json({ error: "This class is not running." }, 409);

  const { data: isAdmin } = await admin.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });
  const isHost = c.host_id === user.id || isAdmin === true;
  if (!isHost) {
    const { data: reg } = await admin
      .from("live_class_registrations")
      .select("id")
      .eq("class_id", c.id)
      .eq("user_id", user.id)
      .is("cancelled_at", null)
      .maybeSingle();
    if (!reg) return json({ error: "Register for this class first." }, 403);
  }

  const now = Math.floor(Date.now() / 1000);
  const start = Math.floor(new Date(c.starts_at).getTime() / 1000);
  const end = start + c.duration_minutes * 60;
  if (now < start - (isHost ? HOST_EARLY_S : EARLY_S) || now > end + LATE_S)
    return json({ error: "The room opens 10 minutes before the class." }, 409);

  const { data: att } = await admin
    .from("live_class_attendance")
    .insert({ class_id: c.id, user_id: user.id })
    .select("id")
    .single();

  const appId = Deno.env.get("JAAS_APP_ID");
  const keyId = Deno.env.get("JAAS_KEY_ID");
  const pem = Deno.env.get("JAAS_PRIVATE_KEY");
  if (!appId || !keyId || !pem)
    return json({
      configured: false,
      room: c.room_name,
      attendance_id: att?.id ?? null,
      moderator: isHost,
      recording: false,
    });

  const canRecord = isHost && c.recording_enabled;
  const name =
    (user.user_metadata?.full_name as string | undefined) ||
    user.email ||
    "Participant";
  const jwt = await signRS256(
    { alg: "RS256", typ: "JWT", kid: keyId },
    {
      aud: "jitsi",
      iss: "chat",
      sub: appId,
      room: c.room_name,
      nbf: now - 60,
      exp: end + 30 * 60,
      context: {
        user: {
          id: user.id,
          name,
          email: user.email ?? "",
          moderator: isHost ? "true" : "false",
        },
        features: {
          livestreaming: "false",
          recording: canRecord ? "true" : "false",
          transcription: "false",
          "outbound-call": "false",
        },
      },
    },
    pem,
  );
  return json({
    configured: true,
    domain: "8x8.vc",
    room: `${appId}/${c.room_name}`,
    jwt,
    attendance_id: att?.id ?? null,
    moderator: isHost,
    recording: canRecord,
  });
}

async function heartbeat(admin: Admin, userId: string, attendanceId: unknown) {
  if (typeof attendanceId !== "string")
    return json({ error: "Missing attendance_id" }, 400);
  const { data: a } = await admin
    .from("live_class_attendance")
    .select("id, class_id, user_id, live_classes(starts_at, duration_minutes)")
    .eq("id", attendanceId)
    .maybeSingle();
  if (!a || a.user_id !== userId) return json({ error: "Not found" }, 404);
  const c = (
    a as unknown as {
      live_classes: { starts_at: string; duration_minutes: number };
    }
  ).live_classes;
  const cap =
    new Date(c.starts_at).getTime() + (c.duration_minutes * 60 + LATE_S) * 1000;
  const at = new Date(Math.min(Date.now(), cap)).toISOString();
  await admin
    .from("live_class_attendance")
    .update({ last_seen_at: at })
    .eq("id", attendanceId)
    .lte("joined_at", at);
  return json({ ok: true });
}

async function recordingUrl(
  userClient: Admin,
  admin: Admin,
  recordingId: unknown,
) {
  if (typeof recordingId !== "string")
    return json({ error: "Missing recording_id" }, 400);
  // Row-level security decides who may see the recording.
  const { data: r } = await userClient
    .from("live_class_recordings")
    .select("id, storage_path, status")
    .eq("id", recordingId)
    .maybeSingle();
  if (!r || r.status !== "stored" || !r.storage_path)
    return json({ error: "Not available" }, 404);
  const { data, error } = await admin.storage
    .from("live-recordings")
    .createSignedUrl(r.storage_path, 60 * 60);
  if (error || !data) return json({ error: "Not available" }, 500);
  return json({ url: data.signedUrl });
}

async function signRS256(header: object, payload: object, pem: string) {
  const der = Uint8Array.from(
    atob(pem.replace(/-----[^-]+-----|\s/g, "")),
    (ch) => ch.charCodeAt(0),
  );
  const key = await crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const input = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(input),
  );
  return `${input}.${b64url(new Uint8Array(sig))}`;
}

function b64url(v: string | Uint8Array) {
  const bytes = typeof v === "string" ? new TextEncoder().encode(v) : v;
  let s = "";
  for (const x of bytes) s += String.fromCharCode(x);
  return btoa(s).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
