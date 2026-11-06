// Consent gate for AI features that send health data to the model provider.
// Law 09-08 (art. 44): sensitive data leaves Morocco for the US only on the
// person's express consent, so every AI function checks it here, server-side.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/** Bump when the consent text changes materially; users are asked again. */
export const AI_CONSENT_VERSION = "2026-11";

/** Whether `userId` agreed to AI processing (checked with the service role). */
export async function hasAiConsent(userId: string): Promise<boolean> {
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data, error } = await admin.rpc("has_ai_consent", { _user: userId });
  // Fail closed: no answer is no consent.
  return !error && data === true;
}

/**
 * 403 telling the app which consent is missing: the caller's own
 * ("ai_consent_required") or, for a specialist tool, their client's
 * ("client_ai_consent_required").
 */
export function consentMissing(
  who: "self" | "client",
  headers: Record<string, string>,
): Response {
  const code =
    who === "self" ? "ai_consent_required" : "client_ai_consent_required";
  return new Response(
    JSON.stringify({
      error:
        who === "self"
          ? "Agree to AI processing before using this feature."
          : "Your client has not agreed to AI processing of their data.",
      code,
    }),
    {
      status: 403,
      headers: { ...headers, "Content-Type": "application/json" },
    },
  );
}
