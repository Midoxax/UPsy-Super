import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { buildRejectionEmail } from "../_shared/email-templates/accreditation/rejection.ts";
import { sender } from "../_shared/sender.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface RejectionRequest {
  applicationId: string;
  reason?: string;
}

// Validate and sanitize inputs
function validateRequest(body: unknown): RejectionRequest {
  if (!body || typeof body !== 'object') {
    throw new Error("Invalid request body");
  }

  const { applicationId, reason } = body as Record<string, unknown>;

  // Validate applicationId
  if (!applicationId || typeof applicationId !== 'string' || !UUID_REGEX.test(applicationId)) {
    throw new Error("Invalid application ID format");
  }

  // Validate and sanitize reason (optional)
  let sanitizedReason: string | undefined;
  if (reason !== undefined && reason !== null) {
    if (typeof reason !== 'string') {
      throw new Error("Reason must be a string");
    }
    // Trim and limit length
    sanitizedReason = reason.trim().slice(0, 500);
    // Remove potentially dangerous characters for HTML context
    sanitizedReason = sanitizedReason
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  return {
    applicationId: applicationId.trim(),
    reason: sanitizedReason,
  };
}

// Sanitize error messages for client responses
function sanitizeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  
  // Map known error types to safe messages
  if (message.includes("Unauthorized") || message.includes("Admin role required")) {
    return "Unauthorized: Admin access required";
  }
  if (message.includes("Application not found")) {
    return "Application not found";
  }
  if (message.includes("Application already")) {
    return "Application has already been processed";
  }
  if (message.includes("Invalid")) {
    return "Invalid request data";
  }
  
  // Generic fallback for unknown errors
  return "Failed to process rejection request";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify caller via JWT (do NOT trust adminUserId from body)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claimsData, error: claimsErr } = await supabaseAuth.auth.getClaims(
      authHeader.replace("Bearer ", ""),
    );
    if (claimsErr || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const adminUserId = claimsData.claims.sub as string;

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Validate and sanitize input
    const rawBody = await req.json();
    const { applicationId, reason } = validateRequest(rawBody);

    console.log("Processing rejection for application:", applicationId);

    // 1. Verify admin role
    const { data: adminRole, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", adminUserId)
      .eq("role", "admin")
      .single();

    if (roleError || !adminRole) {
      throw new Error("Unauthorized: Admin role required");
    }

    // 2. Fetch application
    const { data: application, error: appError } = await supabaseClient
      .from("psychologist_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      throw new Error("Application not found");
    }

    if (application.status !== "pending") {
      throw new Error(`Application already ${application.status}`);
    }

    // 3. Update application status
    const { error: updateError } = await supabaseClient
      .from("psychologist_applications")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminUserId,
        notes: reason || "Application rejected",
      })
      .eq("id", applicationId);

    if (updateError) {
      console.error("Application update error:", updateError);
      throw new Error("Failed to update application");
    }

    // 4. Send rejection email (reason is already HTML-escaped)
    const { subject, html } = buildRejectionEmail({
      locale: (application as any).preferred_locale,
      fullName: application.full_name,
      reason,
    });
    const { error: emailError } = await resend.emails.send({
      from: sender(),
      to: [application.email],
      subject,
      html,
    });

    if (emailError) {
      console.error("Email sending error:", emailError);
      // Don't throw - status is updated, just log the error
    }

    console.log("Rejection processed successfully for:", applicationId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Application rejected and email sent",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error in send-rejection-email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: sanitizeError(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
