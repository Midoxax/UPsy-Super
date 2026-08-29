import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type RiskLevel = "low" | "moderate" | "high";

const SESSION_FLAG = "upsy:crisis:shown";

/**
 * Polls the crisis-screening edge function on dashboard mount.
 * Surfaces the CrisisModal at most once per session for moderate/high risk.
 * Never persists user content; only the risk level is returned.
 */
export function useCrisisScreening() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [risk, setRisk] = useState<RiskLevel>("low");

  useEffect(() => {
    if (!user) return;
    if (sessionStorage.getItem(SESSION_FLAG)) return;

    let cancelled = false;
    const run = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("crisis-screening", {
          body: { user_id: user.id },
        });
        if (cancelled || error || !data) return;
        const level = (data.risk_level as RiskLevel) || "low";
        if (level === "moderate" || level === "high") {
          setRisk(level);
          setOpen(true);
          sessionStorage.setItem(SESSION_FLAG, "1");
        }
      } catch {
        // silent — never block the dashboard on a screening failure
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { open, setOpen, risk };
}
