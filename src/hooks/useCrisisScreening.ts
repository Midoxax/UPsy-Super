import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type RiskLevel = "low" | "moderate" | "high";

const SESSION_FLAG = "upsy:crisis:shown";

export function useCrisisScreening() {
  const [open, setOpen] = useState(false);
  const [risk, setRisk] = useState<RiskLevel>("low");

  const screen = useCallback(async (text: string): Promise<RiskLevel> => {
    const trimmed = text.trim();
    if (trimmed.length < 3) return "low";

    try {
      const { data, error } = await supabase.functions.invoke("crisis-screening", {
        body: { text: trimmed },
      });
      if (error || !data) return "low";

      const level: RiskLevel =
        data.risk_level === "high" || data.risk_level === "moderate" ? data.risk_level : "low";

      if (level !== "low" && !sessionStorage.getItem(SESSION_FLAG)) {
        setRisk(level);
        setOpen(true);
        sessionStorage.setItem(SESSION_FLAG, "1");
      }

      return level;
    } catch {
      // Never block the product on screening infrastructure.
      return "low";
    }
  }, []);

  return { open, setOpen, risk, screen };
}
