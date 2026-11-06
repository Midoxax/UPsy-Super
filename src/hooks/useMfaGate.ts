import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * "ok" when the account needs no second factor or this session already used
 * one (assurance level aal2); "needed" when a specialist or admin is signed
 * in with a password only. The database refuses their clinical and admin
 * data in that state too, so this gate is the friendly front of a hard rule.
 */
export function useMfaGate(required: boolean, ready: boolean) {
  const [state, setState] = useState<"checking" | "ok" | "needed">("checking");

  useEffect(() => {
    if (!ready) return;
    if (!required) {
      setState("ok");
      return;
    }
    let live = true;
    setState("checking");
    supabase.auth.mfa
      .getAuthenticatorAssuranceLevel()
      .then(({ data }) => {
        if (live) setState(data?.currentLevel === "aal2" ? "ok" : "needed");
      })
      .catch(() => live && setState("needed"));
    return () => {
      live = false;
    };
  }, [required, ready]);

  return state;
}
