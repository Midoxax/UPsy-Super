// Edge function: psychologist proposes a session to a client.
// Creates a booking with status='proposed', generates a token,
// and sends a branded email with Accept / Decline links.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createLogger } from "../_shared/logger.ts";
import { sender } from "../_shared/sender.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Body {
  client_email: string;
  client_name?: string;
  scheduled_at: string;
  duration_minutes: number;
  session_type: "online" | "video" | "in_person" | "phone";
  notes?: string;
}

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function genToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const log = createLogger(req, "propose-session");

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const psychologistId = userData.user.id;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Verify the user is actually a psychologist
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", psychologistId)
      .eq("role", "psychologist")
      .maybeSingle();
    if (!roleRow) {
      return new Response(
        JSON.stringify({ error: "Only psychologists can propose sessions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as Body;
    if (!body.client_email || !isValidEmail(body.client_email)) {
      return new Response(
        JSON.stringify({ error: "Invalid client email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!body.scheduled_at || isNaN(new Date(body.scheduled_at).getTime())) {
      return new Response(
        JSON.stringify({ error: "Invalid scheduled date" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (new Date(body.scheduled_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Scheduled date must be in the future" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (![30, 45, 50, 60, 90].includes(body.duration_minutes)) {
      return new Response(
        JSON.stringify({ error: "Invalid duration" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    // Normalize "video" → "online" for consistency with booking modal
    if (body.session_type === "video") body.session_type = "online";
    if (!["online", "in_person", "phone"].includes(body.session_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid session type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Slot validation: in-future + inside availability window + no overlapping booking
    const { data: slotCheck, error: slotErr } = await admin.rpc("check_proposal_slot", {
      _psy: psychologistId,
      _start: body.scheduled_at,
      _duration: body.duration_minutes,
    });
    if (slotErr) {
      log.error("slot check error", slotErr);
      return new Response(
        JSON.stringify({ error: "Could not validate slot" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const check = slotCheck as { ok: boolean; reason?: string } | null;
    if (!check?.ok) {
      const reason = check?.reason ?? "invalid_slot";
      const messages: Record<string, string> = {
        too_soon: "The session must be at least 1 hour in the future.",
        outside_availability:
          "This time falls outside your configured availability. Update your weekly hours or pick another time.",
        slot_conflict:
          "You already have a booking that overlaps with this time.",
        invalid_input: "Invalid slot.",
      };
      // Audit the rejection
      await admin.from("audit_log").insert({
        user_id: psychologistId,
        action: "proposal.rejected_validation",
        resource_type: "bookings",
        metadata: {
          scheduled_at: body.scheduled_at,
          duration_minutes: body.duration_minutes,
          reason,
          client_email: body.client_email,
        },
      });
      return new Response(
        JSON.stringify({ error: messages[reason] ?? "Invalid slot", reason }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Resolve client: existing user by email, else null patient_id (token-based)
    const email = body.client_email.trim().toLowerCase();
    // NOTE: auth.admin.listUsers() crashes with NULL confirmation_token rows
    // ("converting NULL to string is unsupported") — query the table directly.
    const { data: existingRows } = await admin
      .schema("auth")
      .from("users")
      .select("id,email")
      .ilike("email", email)
      .limit(1);
    const existing = existingRows?.[0] as { id: string; email: string } | undefined;
    const patientId = existing?.id ?? psychologistId; // placeholder when unknown; RLS uses patient_email too

    const proposalToken = genToken();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

    const { data: booking, error: insertErr } = await admin
      .from("bookings")
      .insert({
        psychologist_id: psychologistId,
        patient_id: existing?.id ?? psychologistId,
        patient_email: email,
        scheduled_at: body.scheduled_at,
        duration_minutes: body.duration_minutes,
        session_type: body.session_type,
        status: "proposed",
        payment_status: "unpaid",
        patient_notes: body.notes ?? null,
        proposed_by: psychologistId,
        proposal_token: proposalToken,
        proposal_expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (insertErr) {
      log.error("insert error", insertErr);
      return new Response(
        JSON.stringify({ error: insertErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Get psychologist display info for the email
    const { data: psyProfile } = await admin
      .from("psychologist_profiles")
      .select("full_name, photo_url")
      .eq("id", psychologistId)
      .maybeSingle();

    const psyName = psyProfile?.full_name ?? "Your psychologist";

    const escapeHtml = (s: string) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    // Build response URLs from a server-side trusted origin (never trust client headers in emails)
    const origin = Deno.env.get("SITE_URL") ?? "https://upsy.ma";
    const acceptUrl = `${origin}/booking/respond/${proposalToken}?action=accept`;
    const declineUrl = `${origin}/booking/respond/${proposalToken}?action=decline`;

    const dateStr = new Date(body.scheduled_at).toLocaleString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,sans-serif;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="color:#6B1F2A;margin:0;font-size:22px;">U.Psy</h1>
    </div>
    <h2 style="color:#1a1a1a;margin:0 0 16px;">Session invitation from ${escapeHtml(psyName)}</h2>
    <p style="color:#444;line-height:1.6;margin:0 0 20px;">
      ${escapeHtml(psyName)} has proposed a session with you. Please confirm or decline below.
    </p>
    <div style="background:#FAF7F5;border-left:4px solid #6B1F2A;padding:16px;margin:20px 0;border-radius:4px;">
      <p style="margin:0 0 6px;"><strong>When:</strong> ${dateStr}</p>
      <p style="margin:0 0 6px;"><strong>Duration:</strong> ${body.duration_minutes} minutes</p>
      <p style="margin:0;"><strong>Type:</strong> ${escapeHtml(body.session_type.replace("_", " "))}</p>
      ${body.notes ? `<p style="margin:12px 0 0;font-style:italic;color:#666;">"${escapeHtml(body.notes)}"</p>` : ""}
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="${acceptUrl}" style="display:inline-block;background:#6B1F2A;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:0 6px;">Accept</a>
      <a href="${declineUrl}" style="display:inline-block;background:#ffffff;color:#6B1F2A;border:1px solid #6B1F2A;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:0 6px;">Decline</a>
    </div>
    <p style="color:#888;font-size:12px;line-height:1.5;text-align:center;margin-top:32px;">
      This invitation expires in 72 hours.<br/>
      Conformément à la loi 09-08, vos données personnelles sont protégées.
    </p>
  </div>
</body></html>`;

    // Send via Resend (already configured in project secrets)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      try {
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: sender(),
            to: [email],
            subject: `Session invitation from ${psyName.replace(/[\r\n<>]/g, " ")}`,
            html,
          }),
        });
        if (!resp.ok) {
          const text = await resp.text();
          log.warn("email send failed", { response: text });
        }
      } catch (e) {
        log.warn("email error", { error: String(e) });
      }
    }

    log.info("proposal created", { bookingId: booking.id, emailSent: !!RESEND_API_KEY });
    return new Response(
      JSON.stringify({
        ok: true,
        booking_id: booking.id,
        email_sent: !!RESEND_API_KEY,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    log.error("unhandled error", e);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});