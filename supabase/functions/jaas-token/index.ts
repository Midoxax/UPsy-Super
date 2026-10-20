// Issues an 8x8 Jitsi-as-a-Service (JaaS) token for one booked session.
// Only the session's client and specialist get one, only for a confirmed
// online session, and only from 10 minutes before the start until the end.
// The specialist joins as moderator (can admit from the lobby, end the call);
// the client joins as a guest. Without the JAAS_* secrets the function
// answers { configured: false } and the page falls back to meet.jit.si.
//
// Secrets: JAAS_APP_ID ("vpaas-magic-cookie-…"), JAAS_KEY_ID (the API key
// id shown in the JaaS console, "vpaas-magic-cookie-…/abc123"), and
// JAAS_PRIVATE_KEY (the PKCS#8 PEM downloaded when the key was created).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const JOIN_EARLY_S = 10 * 60;
const JOIN_LATE_S = 5 * 60;

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

    const { booking_id } = await req.json();
    if (!booking_id || typeof booking_id !== "string")
      return json({ error: "Missing booking_id" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: b } = await admin
      .from("bookings")
      .select(
        "id, patient_id, psychologist_id, status, session_type, scheduled_at, duration_minutes, video_room_id",
      )
      .eq("id", booking_id)
      .maybeSingle();
    if (!b) return json({ error: "Not found" }, 404);

    const isSpecialist = b.psychologist_id === user.id;
    if (!isSpecialist && b.patient_id !== user.id)
      return json({ error: "Forbidden" }, 403);
    if (
      b.status !== "confirmed" ||
      b.session_type === "in_person" ||
      !b.video_room_id
    )
      return json({ error: "This session has no video room." }, 409);

    const now = Math.floor(Date.now() / 1000);
    const start = Math.floor(new Date(b.scheduled_at).getTime() / 1000);
    const end = start + (b.duration_minutes ?? 50) * 60;
    if (now < start - JOIN_EARLY_S || now > end + JOIN_LATE_S)
      return json(
        { error: "The room opens 10 minutes before the session." },
        409,
      );

    const appId = Deno.env.get("JAAS_APP_ID");
    const keyId = Deno.env.get("JAAS_KEY_ID");
    const pem = Deno.env.get("JAAS_PRIVATE_KEY");
    if (!appId || !keyId || !pem) return json({ configured: false });

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
        room: b.video_room_id,
        nbf: now - 60,
        exp: end + 30 * 60,
        context: {
          user: {
            id: user.id,
            name,
            email: user.email ?? "",
            moderator: isSpecialist ? "true" : "false",
          },
          // No recording, streaming or transcription for clinical sessions.
          features: {
            livestreaming: "false",
            recording: "false",
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
      room: `${appId}/${b.video_room_id}`,
      jwt,
      moderator: isSpecialist,
    });
  } catch (e) {
    console.error("jaas-token", e);
    return json({ error: "Could not prepare the room" }, 500);
  }
});

async function signRS256(header: object, payload: object, pem: string) {
  const der = Uint8Array.from(
    atob(pem.replace(/-----[^-]+-----|\s/g, "")),
    (c) => c.charCodeAt(0),
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
