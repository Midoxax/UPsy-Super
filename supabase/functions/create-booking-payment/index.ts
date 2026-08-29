import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  psychologistId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(180).default(50),
  sessionType: z.enum(["online", "in_person"]).default("online"),
  patientNotes: z.string().max(1000).optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const input = parsed.data;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Load psychologist + pricing config
    const { data: psy, error: psyErr } = await admin
      .from("psychologist_profiles")
      .select("id, full_name, hourly_rate_mad, deposit_percentage, is_published")
      .eq("id", input.psychologistId)
      .single();
    if (psyErr || !psy || !psy.is_published) {
      return new Response(JSON.stringify({ error: "Psychologist not available" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!psy.hourly_rate_mad) {
      return new Response(JSON.stringify({ error: "Psychologist has no rate set" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: pricing } = await admin
      .from("platform_pricing_config")
      .select("commission_rate, vat_rate, deposit_percentage, min_session_price_mad, max_session_price_mad")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const commissionRate = Number(pricing?.commission_rate ?? 20) / 100;
    const vatRate = Number(pricing?.vat_rate ?? 20) / 100;
    const total = Number(psy.hourly_rate_mad);
    const depositPct = Number(psy.deposit_percentage ?? pricing?.deposit_percentage ?? 50) / 100;
    const depositAmount = Math.round(total * depositPct * 100) / 100;
    const balanceAmount = Math.round((total - depositAmount) * 100) / 100;
    const commission = Math.round(total * commissionRate * 100) / 100;
    const vat = Math.round(commission * vatRate * 100) / 100;
    const netToPsy = Math.round((total - commission - vat) * 100) / 100;

    // Create booking (pending payment)
    const { data: booking, error: bookErr } = await admin
      .from("bookings")
      .insert({
        patient_id: userId,
        psychologist_id: input.psychologistId,
        scheduled_at: input.scheduledAt,
        duration_minutes: input.durationMinutes,
        session_type: input.sessionType,
        status: "pending",
        payment_status: "pending_deposit",
        amount_mad: total,
        patient_notes: input.patientNotes ?? null,
      })
      .select("id")
      .single();
    if (bookErr || !booking) {
      return new Response(JSON.stringify({ error: "Could not create booking", detail: bookErr?.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create deposit transaction (mock provider)
    const mockPaymentId = `mock_${crypto.randomUUID()}`;
    const { data: tx, error: txErr } = await admin
      .from("payment_transactions")
      .insert({
        booking_id: booking.id,
        patient_id: userId,
        psychologist_id: input.psychologistId,
        transaction_type: "deposit",
        status: "pending",
        amount_mad: depositAmount,
        commission_mad: Math.round(commission * depositPct * 100) / 100,
        vat_mad: Math.round(vat * depositPct * 100) / 100,
        net_to_psychologist_mad: Math.round(netToPsy * depositPct * 100) / 100,
        provider: "mock",
        provider_payment_id: mockPaymentId,
        provider_metadata: { mock: true, requires_simulation: true },
      })
      .select("id")
      .single();
    if (txErr) {
      return new Response(JSON.stringify({ error: "Could not create transaction", detail: txErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        bookingId: booking.id,
        transactionId: tx?.id,
        mockPaymentId,
        breakdown: {
          total_mad: total,
          deposit_amount_mad: depositAmount,
          balance_amount_mad: balanceAmount,
          deposit_percentage: depositPct * 100,
          commission_mad: commission,
          vat_mad: vat,
          net_to_psychologist_mad: netToPsy,
          currency: "MAD",
        },
        provider: "mock",
        message: "Mock payment created — call simulate-payment-webhook to complete",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("create-booking-payment error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});