import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { dismiss, evaluateNudges, type Nudge } from "@/lib/nudges/nudgeEngine";

/**
 * Evaluates behavioral nudges from the user's recent mood data and surfaces
 * them via Sonner toasts. Each nudge is shown at most once per session and
 * dismissals persist for 7 days in localStorage.
 */
export function useNudges() {
  const { user } = useAuth();
  const shownRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const run = async () => {
      const { data } = await supabase
        .from("mood_entries")
        .select("mood_score, recorded_at")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false })
        .limit(30);

      if (cancelled || !data) return;

      const nudges = evaluateNudges(data as { mood_score: number; recorded_at: string }[]);
      for (const n of nudges) {
        if (shownRef.current.has(n.id)) continue;
        shownRef.current.add(n.id);
        showNudge(n);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [user]);
}

function showNudge(n: Nudge) {
  toast(n.title, {
    description: n.body,
    duration: 8000,
    action: n.cta
      ? {
          label: n.cta.label,
          onClick: () => {
            window.location.href = n.cta!.href;
          },
        }
      : undefined,
    onDismiss: () => dismiss(n.id),
    onAutoClose: () => dismiss(n.id),
  });
}
