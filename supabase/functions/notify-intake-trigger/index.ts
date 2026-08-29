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

  try {
    // Authenticate caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = userData.user.id;
    const { data: roles } = await userClient.from("user_roles").select("role").eq("user_id", callerId);
    const isAdmin = (roles ?? []).some((r: any) => r.role === "admin");

    const { client_id, psychologist_id, booking_id } = await req.json();
    if (!client_id || !psychologist_id) {
      return new Response(JSON.stringify({ error: "Missing client_id or psychologist_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Authorize: caller must be the linked psychologist or admin
    if (!isAdmin && callerId !== psychologist_id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Get client email
    const { data: user } = await supabase.auth.admin.getUserById(client_id);
    const email = user?.user?.email;
    const firstName = user?.user?.user_metadata?.full_name?.split(" ")[0] || "Bonjour";

    // Get psychologist name
    const { data: psyProfile } = await supabase
      .from("psychologist_profiles")
      .select("full_name")
      .eq("id", psychologist_id)
      .maybeSingle();
    const psyName = psyProfile?.full_name || "ton/ta psychologue";

    // Get booking date
    let sessionDate = "";
    if (booking_id) {
      const { data: booking } = await supabase
        .from("bookings")
        .select("scheduled_at")
        .eq("id", booking_id)
        .maybeSingle();
      if (booking?.scheduled_at) {
        sessionDate = new Date(booking.scheduled_at).toLocaleDateString("fr-FR", {
          weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
        });
      }
    }

    // Send email
    if (email) {
      await resend.emails.send({
        from: sender(),
        to: [email],
        subject: `Prépare ta première séance avec ${psyName}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#6B1F2A;height:4px;border-radius:2px;margin-bottom:24px;"></div>
            <h2 style="color:#6B1F2A;">Prépare ta séance</h2>
            <p>Bonjour ${firstName},</p>
            <p>Ta séance${sessionDate ? ` du <strong>${sessionDate}</strong>` : ""} est confirmée. Pour aider ${psyName} à bien te recevoir, nous t'invitons à remplir une courte anamnèse — environ 12 minutes.</p>
            <p>Tu peux la faire en plusieurs fois et passer ce qui te met mal à l'aise.</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="https://upsy.ma/intake${booking_id ? `/${booking_id}` : ""}" style="background:#6B1F2A;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Commencer mon anamnèse</a>
            </div>
            <p style="font-size:12px;color:#888;">Ce formulaire est strictement confidentiel et chiffré.</p>
          </div>
        `,
      });
    }

    // Create in-app notification
    await supabase.from("notifications").insert({
      user_id: client_id,
      type: "intake_required",
      title: "Anamnèse à compléter",
      body: `${psyName} souhaite préparer ta première séance. Remplis ton anamnèse (≈12 min).`,
      action_url: `/intake${booking_id ? `/${booking_id}` : ""}`,
      metadata: { psychologist_id, booking_id },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("notify-intake-trigger error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});