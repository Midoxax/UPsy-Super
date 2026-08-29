// Clinical READS have to be logged from the application: Postgres has no
// SELECT trigger. Call this the moment a specialist or assistant opens
// clinical (C1) or identity (C2) data that is not their own.
//
// Failure is swallowed on purpose — an audit write must never break care
// delivery — but it is reported to the console so gaps stay visible.

import { supabase } from "@/integrations/supabase/client";

export type SensitiveClass = "C1" | "C2" | "C3" | "C4";

export async function logSensitiveAccess(params: {
  resourceType: string;
  recordRef?: string | null;
  dataClass?: SensitiveClass;
  subjectId?: string | null;
  context?: Record<string, unknown>;
}): Promise<void> {
  try {
    const { error } = await supabase.rpc("log_sensitive_access", {
      _resource_type: params.resourceType,
      _record_ref: params.recordRef ?? "",
      _data_class: params.dataClass ?? "C1",
      _subject_id: params.subjectId ?? undefined,
      _context: (params.context ?? {}) as never,
      _user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : undefined,
    });
    if (error) throw error;
  } catch (err) {
    console.warn("[audit] sensitive access not logged", params.resourceType, err);
  }
}
