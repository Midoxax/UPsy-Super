import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/** Matches AI_CONSENT_VERSION in supabase/functions/_shared/ai-consent.ts. */
export const AI_CONSENT_VERSION = "2026-11";

/**
 * The signed-in user's consent to AI processing of their data. The edge
 * functions enforce it; this only lets the app ask before the first call
 * instead of failing it.
 */
export function useAiConsent() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ["ai-consent", user?.id];

  const { data, isLoading } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("privacy_preferences")
        .select("ai_consent_at")
        .eq("user_id", user!.id)
        .maybeSingle();
      return (data?.ai_consent_at as string | null) ?? null;
    },
  });

  const set = useCallback(
    async (agree: boolean) => {
      if (!user) return { error: new Error("Not signed in") };
      const { error } = await supabase.from("privacy_preferences").upsert(
        {
          user_id: user.id,
          ai_consent_at: agree ? new Date().toISOString() : null,
          ai_consent_version: agree ? AI_CONSENT_VERSION : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
      if (!error) await qc.invalidateQueries({ queryKey: key });
      return { error };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id, qc],
  );

  return {
    consentedAt: data ?? null,
    hasConsent: !!data,
    isLoading: !!user && isLoading,
    grant: () => set(true),
    withdraw: () => set(false),
  };
}

/** The 403 code an AI function returns when the relevant consent is missing. */
export async function aiConsentErrorCode(
  error: unknown,
): Promise<"ai_consent_required" | "client_ai_consent_required" | null> {
  // supabase-js FunctionsHttpError keeps the Response in `context`.
  const res = (error as { context?: Response } | null)?.context;
  if (!res || typeof res.clone !== "function" || res.status !== 403)
    return null;
  try {
    const body = await res.clone().json();
    return body?.code === "ai_consent_required" ||
      body?.code === "client_ai_consent_required"
      ? body.code
      : null;
  } catch {
    return null;
  }
}
