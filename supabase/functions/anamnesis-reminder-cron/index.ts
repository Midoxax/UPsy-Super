import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { sender } from "../_shared/sender.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const cronSecret = Deno.env.get("CRON_SECRET");
  if (cronSecret) {
    const provided = req.headers.get("Authorization") ?? "";
    if (provided !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

  const now = new Date();
  const horizon = new Date(now.getTime() + 72 * 3600 * 1000);

  // Bookings in next 72h
  const { data: bookings, error: bErr } = await supabase
    .from("bookings")
    .select("id, patient_id, scheduled_at")
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", horizon.toISOString())
    .neq("status", "cancelled");

  if (bErr) {
    console.error("bookings query failed", bErr);
    return new Response(JSON.stringify({ success: false, error: bErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let queued = 0, sent = 0, skipped = 0;

  for (const b of bookings || []) {
    // Check anamnesis status
    const { data: anam } = await supabase
      .from("client_anamneses").select("id, status").eq("client_id", b.patient_id).maybeSingle();
    if (anam?.status === "completed" || anam?.status === "reviewed") { skipped++; continue; }

    // Skip if a reminder was sent in the last 24h
    const yesterday = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
    const { count: recent } = await supabase
      .from("anamnesis_reminders").select("id", { count: "exact", head: true })
      .eq("client_id", b.patient_id).gte("sent_at", yesterday);
    if ((recent || 0) > 0) { skipped++; continue; }

    // Get email from auth
    const { data: u } = await supabase.auth.admin.getUserById(b.patient_id);
    const email = u?.user?.email;
    if (!email) { skipped++; continue; }

    // Insert reminder row
    const { data: rem } = await supabase.from("anamnesis_reminders").insert({
      client_id: b.patient_id,
      booking_id: b.id,
      anamnesis_id: anam?.id || null,
      due_at: b.scheduled_at,
      status: "pending",
    }).select("id").single();
    queued++;

    // Send email (best-effort)
    try {
      await resend.emails.send({
        from: sender(),
        to: [email],
        subject: "Complétez votre intake avant votre séance",
        html: `<p>Bonjour,</p><p>Votre prochaine séance approche. Merci de compléter votre formulaire d'intake (anamnèse) avant le rendez-vous.</p><p><a href="https://upsy.ma/dashboard">Reprendre mon intake</a></p>`,
      });
      if (rem?.id) {
        await supabase.from("anamnesis_reminders").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", rem.id);
      }
      sent++;
    } catch (e: any) {
      if (rem?.id) {
        await supabase.from("anamnesis_reminders").update({ status: "failed", error_message: e?.message }).eq("id", rem.id);
      }
    }
  }

  return new Response(JSON.stringify({ success: true, queued, sent, skipped }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});