import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * The /publish-profile page (20261126150000_publish_on_approval.sql), keyed
 * on the profile's one-time publish token, no login needed:
 *   POST {action:"preview", token} → the profile as patients will see it
 *        (the application photo through a short-lived signed URL)
 *   POST {action:"publish", token, bio?, rate?, hours?} → adds what a
 *        booking needs and the profile lacks (a bio of 80+ characters, a
 *        rate, weekly hours), copies the application photo to the public
 *        bucket if the profile has none, publishes, voids the token
 * psychologist_publish_guard still decides: accreditation, rate, bio and
 * hours are required. Nothing becomes public before the psychologist confirms.
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PRIVATE = "accreditation-docs";
const PUBLIC = "psychologist-photos";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  let body: {
    action?: string;
    token?: string;
    bio?: string;
    rate?: number;
    hours?: { days?: number[]; start?: string; end?: string };
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid" }, 400);
  }
  const t = String(body.token ?? "");
  if (!/^[0-9a-f]{64}$/.test(t)) return json({ error: "invalid" }, 400);

  const db = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });
  const { data: p } = await db
    .from("psychologist_profiles")
    .select(
      "id, full_name, bio, city, photo_url, hourly_rate_mad, offers_online, offers_in_person, is_accredited, is_published, slug",
    )
    .eq("publish_token", t)
    .maybeSingle();
  if (!p) return json({ error: "invalid" }, 404);

  const { data: app } = await db
    .from("psychologist_applications")
    .select("photo_url")
    .eq("user_id", p.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const appPhoto = (app?.photo_url as string | null) ?? null;

  if (body.action === "preview") {
    const [spec, langs, appr] = await Promise.all([
      db
        .from("psychologist_specialties")
        .select("specialties(name)")
        .eq("psychologist_id", p.id),
      db
        .from("psychologist_languages")
        .select("languages(name)")
        .eq("psychologist_id", p.id),
      db
        .from("psychologist_therapy_approaches")
        .select("therapy_approaches(name)")
        .eq("psychologist_id", p.id),
    ]);
    const names = (rows: unknown[] | null, k: string) =>
      (rows ?? [])
        .map((r) => (r as Record<string, { name?: string } | null>)[k]?.name)
        .filter(Boolean);
    let photo = p.photo_url as string | null;
    if (!photo && appPhoto) {
      const { data: s } = await db.storage
        .from(PRIVATE)
        .createSignedUrl(appPhoto, 600);
      photo = s?.signedUrl ?? null;
    }
    const { count: slots } = await db
      .from("availability_slots")
      .select("id", { count: "exact", head: true })
      .eq("psychologist_id", p.id)
      .eq("is_available", true);
    return json({
      full_name: p.full_name,
      bio: p.bio,
      city: p.city,
      photo,
      hourly_rate_mad: p.hourly_rate_mad,
      offers_online: p.offers_online,
      offers_in_person: p.offers_in_person,
      specialties: names(spec.data, "specialties"),
      languages: names(langs.data, "languages"),
      approaches: names(appr.data, "therapy_approaches"),
      accredited: !!p.is_accredited,
      needs: {
        bio: (p.bio ?? "").trim().length < 80,
        rate: p.hourly_rate_mad == null,
        hours: !slots,
      },
    });
  }

  if (body.action === "publish") {
    if (!p.is_accredited) return json({ error: "not accredited" }, 409);

    // What the page collected for what was missing.
    const patch: Record<string, unknown> = {};
    if (typeof body.bio === "string") {
      const bio = body.bio.trim();
      if (bio.length < 80 || bio.length > 4000) {
        return json({ error: "bio" }, 400);
      }
      patch.bio = bio;
    }
    if (body.rate != null) {
      const rate = Number(body.rate);
      if (!Number.isFinite(rate) || rate < 100 || rate > 5000) {
        return json({ error: "rate" }, 400);
      }
      patch.hourly_rate_mad = Math.round(rate);
    }
    if (Object.keys(patch).length) {
      const { error } = await db
        .from("psychologist_profiles")
        .update(patch)
        .eq("id", p.id);
      if (error) return json({ error: "failed" }, 500);
    }
    if (body.hours) {
      const time = /^([01]\d|2[0-3]):[0-5]\d$/;
      const days = [...new Set(body.hours.days ?? [])];
      const { start = "", end = "" } = body.hours;
      if (
        !days.length ||
        days.some((d) => !Number.isInteger(d) || d < 0 || d > 6) ||
        !time.test(start) ||
        !time.test(end) ||
        start >= end
      ) {
        return json({ error: "hours" }, 400);
      }
      // Hours are added only once: a retry after a failed publish keeps them.
      const { count: existing } = await db
        .from("availability_slots")
        .select("id", { count: "exact", head: true })
        .eq("psychologist_id", p.id);
      const { error } = existing
        ? { error: null }
        : await db.from("availability_slots").insert(
            days.map((d) => ({
              psychologist_id: p.id,
              day_of_week: d,
              start_time: start,
              end_time: end,
              is_available: true,
            })),
          );
      if (error) return json({ error: "failed" }, 500);
    }
    let photoUrl = p.photo_url as string | null;
    if (!photoUrl && appPhoto) {
      const { data: file } = await db.storage.from(PRIVATE).download(appPhoto);
      if (file) {
        const ext = appPhoto.split(".").pop() || "jpg";
        const path = `${p.id}/profile-${Date.now()}.${ext}`;
        const { error } = await db.storage
          .from(PUBLIC)
          .upload(path, file, { contentType: file.type || "image/jpeg" });
        if (!error) {
          photoUrl = db.storage.from(PUBLIC).getPublicUrl(path).data.publicUrl;
        }
      }
    }
    const { error } = await db
      .from("psychologist_profiles")
      .update({
        is_published: true,
        publication_confirmed_at: new Date().toISOString(),
        publish_token: null,
        photo_url: photoUrl,
      })
      .eq("id", p.id)
      .eq("publish_token", t);
    // The publish guard names what is still missing.
    if (error) return json({ error: "incomplete", detail: error.message }, 409);
    return json({ published: true, slug: p.slug });
  }

  return json({ error: "invalid" }, 400);
});
