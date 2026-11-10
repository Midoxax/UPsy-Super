// Receives JaaS (8x8.vc) webhooks and keeps live-class recordings.
//
// JaaS stores a recording for 24 hours and sends RECORDING_UPLOADED with a
// pre-authenticated download link. This function copies the file into the
// private "live-recordings" bucket and records it for classification.
//
// Only rooms belonging to an Academy live class are accepted; any other room
// (including clinical sessions, which never allow recording) is ignored.
//
// Authentication: the webhook URL configured in the JaaS console carries a
// secret, ?token=<JAAS_WEBHOOK_TOKEN>. Requests without it are rejected.
import {
  createClient,
  type SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";

/** The fields this function reads from a JaaS webhook. */
interface JaasEvent {
  eventType?: string;
  idempotencyKey?: string;
  sessionId?: string;
  fqn?: string;
  preAuthenticatedLink?: string;
  data?: { preAuthenticatedLink?: string; fqn?: string };
}

type EdgeRuntimeLike = { waitUntil?: (p: Promise<unknown>) => void };

Deno.serve(async (req) => {
  if (req.method !== "POST")
    return new Response("Method not allowed", { status: 405 });

  const expected = Deno.env.get("JAAS_WEBHOOK_TOKEN");
  const given = new URL(req.url).searchParams.get("token") ?? "";
  if (!expected || !safeEqual(given, expected))
    return new Response("Unauthorized", { status: 401 });

  let event: JaasEvent;
  try {
    event = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  if (event?.eventType !== "RECORDING_UPLOADED")
    return new Response("ignored", { status: 200 });

  const link: unknown =
    event?.data?.preAuthenticatedLink ?? event?.preAuthenticatedLink;
  const fqn: unknown = event?.fqn ?? event?.data?.fqn;
  if (
    typeof link !== "string" ||
    !link.startsWith("https://") ||
    typeof fqn !== "string"
  )
    return new Response("missing fields", { status: 200 });

  const room = fqn.split("/").pop()!.toLowerCase();
  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey);

  const { data: c } = await admin
    .from("live_classes")
    .select("id, title, title_fr, title_ar, language, recording_enabled")
    .eq("room_name", room)
    .maybeSingle();
  if (!c || !c.recording_enabled)
    return new Response("ignored", { status: 200 });

  const key = String(
    event.idempotencyKey ?? `${event.sessionId ?? ""}:${link}`,
  );
  const { data: rec, error: insErr } = await admin
    .from("live_class_recordings")
    .upsert(
      {
        class_id: c.id,
        source_key: key,
        source_link: link,
        source_expires_at: new Date(
          Date.now() + 24 * 3600 * 1000,
        ).toISOString(),
        title: c.title,
        title_fr: c.title_fr,
        title_ar: c.title_ar,
        language: c.language,
      },
      { onConflict: "source_key", ignoreDuplicates: true },
    )
    .select("id")
    .maybeSingle();
  if (insErr) {
    console.error("jaas-webhook insert", insErr);
    return new Response("error", { status: 500 });
  }
  // Duplicate delivery of an event already handled.
  if (!rec) return new Response("duplicate", { status: 200 });

  const copy = copyRecording(admin, url, serviceKey, rec.id, c.id, link);
  // Answer JaaS quickly; keep copying in the background where supported.
  const rt = (globalThis as { EdgeRuntime?: EdgeRuntimeLike }).EdgeRuntime;
  if (rt?.waitUntil) {
    rt.waitUntil(copy);
    return new Response("accepted", { status: 202 });
  }
  await copy;
  return new Response("ok", { status: 200 });
});

async function copyRecording(
  admin: SupabaseClient,
  url: string,
  serviceKey: string,
  recordingId: string,
  classId: string,
  link: string,
) {
  try {
    const src = await fetch(link);
    if (!src.ok || !src.body) throw new Error(`download ${src.status}`);
    const type = src.headers.get("content-type") ?? "video/mp4";
    const ext = type.includes("webm") ? "webm" : "mp4";
    const path = `${classId}/${recordingId}.${ext}`;
    // Stream straight into storage, so large files never sit in memory.
    // `duplex` is required by fetch for a streamed request body.
    const init: RequestInit & { duplex: "half" } = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        "Content-Type": type,
        "x-upsert": "true",
      },
      body: src.body,
      duplex: "half",
    };
    const up = await fetch(
      `${url}/storage/v1/object/live-recordings/${path}`,
      init,
    );
    if (!up.ok) throw new Error(`upload ${up.status} ${await up.text()}`);
    const size = Number(src.headers.get("content-length")) || null;
    await admin
      .from("live_class_recordings")
      .update({
        status: "stored",
        storage_path: path,
        size_bytes: size,
        error: null,
      })
      .eq("id", recordingId);
  } catch (e) {
    console.error("jaas-webhook copy", e);
    await admin
      .from("live_class_recordings")
      .update({ status: "failed", error: String(e).slice(0, 500) })
      .eq("id", recordingId);
  }
}

function safeEqual(a: string, b: string) {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  if (x.length !== y.length) return false;
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}
