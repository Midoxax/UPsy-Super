import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { sender } from "../_shared/sender.ts";
import {
  button,
  details,
  divider,
  p,
  renderEmail,
  toText,
} from "../_shared/email/layout.ts";
import { SITE_URL } from "../_shared/site.ts";
import { adminRecipients } from "../_shared/admin-recipients.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  applicationId: z.string().uuid(),
});

type Flag = {
  code: string;
  severity: "info" | "warn" | "block";
  message: string;
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: app, error: appErr } = await adminClient
      .from("psychologist_applications")
      .select("*")
      .eq("id", parsed.data.applicationId)
      .single();

    if (appErr || !app) {
      return new Response(JSON.stringify({ error: "Application not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authorization: applicant or admin
    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);
    const isAdmin = roles?.some((r) => r.role === "admin") ?? false;
    if (app.user_id !== userData.user.id && !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const flags: Flag[] = [];

    // Required identity
    if (!app.full_name || app.full_name.length < 3)
      flags.push({
        code: "missing_name",
        severity: "block",
        message: "Nom complet manquant",
      });
    if (!app.email)
      flags.push({
        code: "missing_email",
        severity: "block",
        message: "Email manquant",
      });
    if (!app.phone)
      flags.push({
        code: "missing_phone",
        severity: "warn",
        message: "Téléphone recommandé",
      });
    if (!app.city)
      flags.push({
        code: "missing_city",
        severity: "warn",
        message: "Ville manquante",
      });
    if (!app.date_of_birth)
      flags.push({
        code: "missing_dob",
        severity: "warn",
        message: "Date de naissance manquante",
      });
    if (!app.languages || app.languages.length === 0)
      flags.push({
        code: "missing_languages",
        severity: "warn",
        message: "Langues parlées manquantes",
      });

    // Required core docs
    if (!app.doc_diploma_url)
      flags.push({
        code: "missing_diploma",
        severity: "block",
        message: "Diplôme obligatoire",
      });
    if (!app.doc_cin_url)
      flags.push({
        code: "missing_cin",
        severity: "block",
        message: "CIN/passeport obligatoire",
      });
    if (!app.doc_license_morocco_url)
      flags.push({
        code: "missing_license",
        severity: "block",
        message: "Autorisation d'exercer Maroc obligatoire",
      });
    if (!app.doc_rib_url)
      flags.push({
        code: "missing_rib",
        severity: "warn",
        message: "RIB recommandé pour les paiements",
      });
    if (!app.doc_order_registration_url)
      flags.push({
        code: "missing_order",
        severity: "warn",
        message: "Inscription à l'ordre/ligue recommandée",
      });
    if (!app.doc_auto_entrepreneur_url)
      flags.push({
        code: "missing_auto_entrepreneur",
        severity: "warn",
        message: "Attestation auto-entrepreneur recommandée",
      });

    // Profile assets
    if (!app.photo_url)
      flags.push({
        code: "missing_photo",
        severity: "block",
        message: "Photo professionnelle obligatoire",
      });
    if (!app.intro_video_url)
      flags.push({
        code: "missing_video",
        severity: "warn",
        message: "Vidéo intro 60s recommandée",
      });

    // Profile content
    if (!app.bio_short || app.bio_short.length < 50)
      flags.push({
        code: "bio_short_too_short",
        severity: "warn",
        message: "Bio courte trop brève",
      });
    if (!app.specialties_requested || app.specialties_requested.length === 0)
      flags.push({
        code: "missing_specialties",
        severity: "block",
        message: "Au moins une spécialité requise",
      });
    if (!app.desired_hourly_rate_mad)
      flags.push({
        code: "missing_rate",
        severity: "warn",
        message: "Tarif horaire manquant",
      });

    // Suggested level
    const blockCount = flags.filter((f) => f.severity === "block").length;
    const warnCount = flags.filter((f) => f.severity === "warn").length;
    const hasInsurance = !!app.doc_insurance_url;
    const hasSpecialtyCerts = (app.doc_specialty_certs_urls?.length ?? 0) > 0;
    const hasCV = !!app.doc_cv_url;

    let suggestedLevel = "provisional";
    let autoStatus: "passed" | "needs_manual_check" | "failed" =
      "needs_manual_check";

    if (blockCount === 0) {
      if (hasInsurance && hasSpecialtyCerts && hasCV && warnCount <= 2) {
        suggestedLevel = "accredited";
        autoStatus = "passed";
      } else if ((hasInsurance || hasSpecialtyCerts) && warnCount <= 4) {
        suggestedLevel = "verified";
        autoStatus = "passed";
      } else {
        suggestedLevel = "provisional";
        autoStatus = "passed";
      }
    } else {
      autoStatus = "failed";
    }

    await adminClient
      .from("psychologist_applications")
      .update({
        auto_check_status: autoStatus,
        auto_check_flags: flags,
        suggested_level: suggestedLevel,
        auto_checked_at: new Date().toISOString(),
      })
      .eq("id", app.id);

    // Email the applicant and the admins once: on the applicant's first
    // submission that passes the auto-check (re-checks do not re-notify).
    let firstSubmission = false;
    if (autoStatus !== "failed" && app.user_id === userData.user.id) {
      const { count } = await adminClient
        .from("accreditation_decisions")
        .select("id", { count: "exact", head: true })
        .eq("application_id", app.id)
        .eq("decision", "auto_check")
        .neq("reason", "Auto-check: failed");
      firstSubmission = (count ?? 0) === 0;
    }

    await adminClient.from("accreditation_decisions").insert({
      application_id: app.id,
      decided_by: userData.user.id,
      decision: "auto_check",
      level_assigned: suggestedLevel,
      reason: `Auto-check: ${autoStatus}`,
      metadata: { flags, blockCount, warnCount },
    });

    if (firstSubmission) {
      // Best-effort: a mail failure must not fail the submission.
      try {
        await notifySubmission(app, suggestedLevel);
      } catch (e) {
        console.warn("[verify-application] notification failed", e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        autoStatus,
        suggestedLevel,
        flags,
        blockCount,
        warnCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("verify-application error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function sendMail(
  key: string,
  to: string[],
  subject: string,
  html: string,
): Promise<boolean> {
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: sender(),
      to,
      subject,
      html,
      text: toText(html),
    }),
  });
  if (!resp.ok)
    console.warn("[verify-application] send failed", await resp.text());
  return resp.ok;
}

async function notifySubmission(
  app: {
    id: string;
    full_name: string | null;
    email: string | null;
    city: string | null;
  },
  suggestedLevel: string,
) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) {
    console.warn("[verify-application] RESEND_API_KEY not set; no email");
    return;
  }

  if (app.email) {
    await sendMail(
      key,
      [app.email],
      "Dossier reçu · Application received · U.Psy",
      renderEmail({
        locale: "fr",
        preheader:
          "Votre dossier est entre de bonnes mains. Your application is in.",
        eyebrow: "Candidature spécialiste",
        title: `Merci, ${app.full_name ?? ""}`.trim(),
        body:
          p(
            "Nous avons bien reçu votre dossier. Notre équipe vérifie vos diplômes et votre inscription, puis vous écrit dès qu'une décision est prise.",
            "fr",
          ) +
          details(
            [
              ["Étape 1", "Dossier reçu"],
              ["Étape 2", "Vérification par l'équipe"],
              ["Étape 3", "Décision par e-mail"],
            ],
            "fr",
          ) +
          divider() +
          p(
            "We have received your application. Our team checks your degrees and registration, then emails you as soon as a decision is made.",
            "en",
          ),
      }),
    );
  }

  const admins = await adminRecipients();
  if (admins.length > 0) {
    const reviewUrl = `${SITE_URL}/admin/applications`;
    await sendMail(
      key,
      admins,
      `Nouvelle candidature spécialiste · ${(app.full_name ?? "").slice(0, 80)}`,
      renderEmail({
        locale: "fr",
        preheader: `${app.full_name ?? ""} attend votre vérification.`,
        eyebrow: "Admin · Candidature",
        title: "Nouvelle candidature à vérifier",
        body:
          details(
            [
              ["Nom", app.full_name ?? ""],
              ["E-mail", app.email ?? ""],
              ["Ville", app.city ?? ""],
              ["Niveau suggéré", suggestedLevel],
            ],
            "fr",
          ) + button("Vérifier les candidatures", reviewUrl, "fr"),
        footerNote: "Alerte envoyée aux administrateurs U.Psy.",
      }),
    );
  } else {
    console.warn("[verify-application] no admin recipient for the alert");
  }
}
