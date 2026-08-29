import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { buildApprovalEmail } from "../_shared/email-templates/accreditation/approval.ts";
import { sender } from "../_shared/sender.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ProvisionRequestSchema = z.object({
  applicationId: z.string().uuid("Invalid application ID format"),
});

type StepName =
  | "auth_user"
  | "role_upsert"
  | "profile_insert"
  | "subscription_insert"
  | "application_update"
  | "email_send";

interface StepRecord {
  step: StepName;
  ok: boolean;
  ms: number;
  skipped?: boolean;
  error?: string;
}

function logEvent(payload: Record<string, unknown>) {
  console.log(JSON.stringify({ event: "provision", ...payload }));
}

async function timed<T>(step: StepName, fn: () => Promise<T>, steps: StepRecord[]): Promise<T> {
  const t0 = Date.now();
  try {
    const r = await fn();
    steps.push({ step, ok: true, ms: Date.now() - t0 });
    return r;
  } catch (e: any) {
    steps.push({ step, ok: false, ms: Date.now() - t0, error: e?.message || String(e) });
    throw e;
  }
}

function errorCodeForStep(step: StepName | null): string {
  switch (step) {
    case "auth_user": return "AUTH_CREATE_FAILED";
    case "role_upsert": return "ROLE_UPSERT_FAILED";
    case "profile_insert": return "PROFILE_INSERT_FAILED";
    case "subscription_insert": return "SUBSCRIPTION_INSERT_FAILED";
    case "application_update": return "APP_UPDATE_FAILED";
    case "email_send": return "EMAIL_SEND_FAILED";
    default: return "UNKNOWN";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startedAt = Date.now();
  const steps: StepRecord[] = [];
  let applicationId: string | null = null;
  let adminUserId: string | null = null;
  let userId: string | null = null;
  let isNewUser = false;
  let alreadyProvisioned = false;
  let partial = false;
  let lastStep: StepName | null = null;
  let attemptId: string | null = null;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  async function recordAttempt(status: "success" | "failure" | "partial", errorCode?: string, errorMessage?: string) {
    try {
      const { data, error } = await supabase
        .from("provisioning_attempts")
        .insert({
          application_id: applicationId,
          admin_user_id: adminUserId,
          user_id: userId,
          status,
          reused_existing_user: !isNewUser && !!userId,
          already_provisioned: alreadyProvisioned,
          error_code: errorCode || null,
          error_message: errorMessage || null,
          duration_ms: Date.now() - startedAt,
          steps,
        })
        .select("id")
        .single();
      if (error) console.error("attempt insert failed", error);
      attemptId = data?.id ?? null;
    } catch (e) {
      console.error("attempt insert exception", e);
    }
  }

  try {
    // Verify caller via JWT (do NOT trust adminUserId from body)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, errorCode: "UNAUTHORIZED", error: "Missing authorization" }),
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
        JSON.stringify({ success: false, errorCode: "UNAUTHORIZED", error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    adminUserId = claimsData.claims.sub as string;

    const raw = await req.json();
    const parsed = ProvisionRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ success: false, errorCode: "VALIDATION", error: "Invalid request data", details: parsed.error.errors.map(e => e.message) }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    applicationId = parsed.data.applicationId;

    logEvent({ phase: "start", applicationId, adminUserId });

    // Verify admin
    const { data: adminRole, error: roleErr } = await supabase
      .from("user_roles").select("role")
      .eq("user_id", adminUserId).eq("role", "admin").maybeSingle();
    if (roleErr || !adminRole) {
      return new Response(
        JSON.stringify({ success: false, errorCode: "UNAUTHORIZED", error: "Admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch application
    const { data: application, error: appErr } = await supabase
      .from("psychologist_applications").select("*").eq("id", applicationId).single();
    if (appErr || !application) throw new Error("Application not found");

    const tempPassword = crypto.randomUUID().substring(0, 16);

    // ======== STEP 1: auth user ========
    lastStep = "auth_user";
    if (application.user_id) {
      // already linked → reuse
      userId = application.user_id;
      isNewUser = false;
      steps.push({ step: "auth_user", ok: true, ms: 0, skipped: true });
    } else {
      await timed("auth_user", async () => {
        const { data: created, error } = await supabase.auth.admin.createUser({
          email: application.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { full_name: application.full_name },
        });
        if (created?.user) {
          userId = created.user.id;
          isNewUser = true;
          return;
        }
        const msg = error?.message?.toLowerCase() || "";
        const exists = msg.includes("already") || (error as any)?.code === "email_exists";
        if (!exists) throw new Error(error?.message || "auth create failed");

        // Self-approval fallback: admin email == applicant email
        const { data: adminUserData } = await supabase.auth.admin.getUserById(adminUserId!);
        if (adminUserData.user?.email?.toLowerCase() === application.email.toLowerCase()) {
          userId = adminUserId;
          isNewUser = false;
          return;
        }
        throw new Error("Email already exists but no linked user_id; cannot resolve safely");
      }, steps);
    }

    if (!userId) throw new Error("Failed to resolve user id");

    // Pre-flight: check what already exists
    const [{ data: existingRole }, { data: existingProfile }, { data: existingSub }] = await Promise.all([
      supabase.from("user_roles").select("user_id").eq("user_id", userId).eq("role", "psychologist").maybeSingle(),
      supabase.from("psychologist_profiles").select("id").eq("id", userId).maybeSingle(),
      supabase.from("subscriptions").select("id").eq("psychologist_id", userId).maybeSingle(),
    ]);

    const wasFullyProvisioned =
      application.status === "approved" && existingRole && existingProfile && existingSub;
    if (wasFullyProvisioned) {
      alreadyProvisioned = true;
      logEvent({ phase: "already_provisioned", applicationId, userId });
      await recordAttempt("success");
      return new Response(
        JSON.stringify({ success: true, alreadyProvisioned: true, userId, attemptId, steps }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ======== STEP 2: role ========
    lastStep = "role_upsert";
    if (existingRole) {
      steps.push({ step: "role_upsert", ok: true, ms: 0, skipped: true });
    } else {
      await timed("role_upsert", async () => {
        const { error } = await supabase.from("user_roles").upsert(
          { user_id: userId, role: "psychologist" },
          { onConflict: "user_id,role", ignoreDuplicates: true },
        );
        if (error) throw error;
      }, steps);
    }

    // ======== STEP 3: profile ========
    lastStep = "profile_insert";
    if (existingProfile) {
      steps.push({ step: "profile_insert", ok: true, ms: 0, skipped: true });
    } else {
      try {
        await timed("profile_insert", async () => {
          const { error } = await supabase.from("psychologist_profiles").insert({
            id: userId,
            full_name: application.full_name,
            is_accredited: !!application.accreditation_number,
            is_published: false,
          });
          if (error) throw error;
        }, steps);
      } catch (e) {
        // Rollback: only delete auth user if WE created it this call
        if (isNewUser && userId) {
          await supabase.auth.admin.deleteUser(userId);
          logEvent({ phase: "rollback_auth_user", userId });
        }
        throw e;
      }
    }

    // ======== STEP 4: subscription ========
    lastStep = "subscription_insert";
    if (existingSub) {
      steps.push({ step: "subscription_insert", ok: true, ms: 0, skipped: true });
    } else {
      await timed("subscription_insert", async () => {
        const { error } = await supabase.from("subscriptions").insert({
          psychologist_id: userId, plan_type: "free", status: "active",
        });
        if (error) throw error;
      }, steps);
    }

    // ======== STEP 5: application update ========
    lastStep = "application_update";
    if (application.status !== "approved") {
      await timed("application_update", async () => {
        const { error } = await supabase.from("psychologist_applications").update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminUserId,
          user_id: userId,
        }).eq("id", applicationId);
        if (error) throw error;
      }, steps);
    } else {
      steps.push({ step: "application_update", ok: true, ms: 0, skipped: true });
      partial = true; // we recovered missing pieces on an already-approved app
    }

    // ======== STEP 6: email ========
    lastStep = "email_send";
    try {
      await timed("email_send", async () => {
        const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
        const supaUrl = Deno.env.get("SUPABASE_URL") || "";
        const loginUrl = supaUrl.replace(/^https:\/\/([^.]+)\.supabase\.co.*/i, "https://$1.lovable.app/auth") || "https://upsy.ma/auth";
        const { subject, html } = buildApprovalEmail({
          locale: application.preferred_locale,
          fullName: application.full_name,
          email: application.email,
          loginUrl,
          isNewUser,
          tempPassword: isNewUser ? tempPassword : undefined,
        });
        const { error } = await resend.emails.send({
          from: sender(),
          to: [application.email],
          subject,
          html,
        });
        if (error) throw error;
      }, steps);
    } catch (e: any) {
      // email failure is non-fatal — record as partial
      partial = true;
      logEvent({ phase: "email_failed_nonfatal", applicationId, error: e?.message });
    }

    const finalStatus: "success" | "partial" = partial ? "partial" : "success";
    await recordAttempt(finalStatus);
    logEvent({ phase: "done", applicationId, userId, status: finalStatus, isNewUser, ms: Date.now() - startedAt });

    return new Response(
      JSON.stringify({
        success: true,
        userId,
        reusedExistingUser: !isNewUser,
        partial,
        attemptId,
        steps,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    const errorCode = errorCodeForStep(lastStep);
    const errorMessage = e?.message || String(e);
    logEvent({ phase: "failure", applicationId, lastStep, errorCode, errorMessage });
    await recordAttempt("failure", errorCode, errorMessage);
    return new Response(
      JSON.stringify({ success: false, errorCode, error: errorMessage, attemptId, steps }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});