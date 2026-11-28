import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { PerfCopy } from "@/lib/performance/copy";

/** The Monday report by email: on by default (performance_weekly_report). */
export default function WeeklyReportToggle({ c }: { c: PerfCopy }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ["perf-weekly-email", user?.id];
  const { data: on = true } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async () =>
      (
        await supabase
          .from("notification_preferences")
          .select("email_performance")
          .eq("user_id", user!.id)
          .maybeSingle()
      ).data?.email_performance ?? true,
  });
  const set = async (v: boolean) => {
    qc.setQueryData(key, v);
    await supabase
      .from("notification_preferences")
      .upsert(
        { user_id: user!.id, email_performance: v },
        { onConflict: "user_id" },
      );
    qc.invalidateQueries({ queryKey: key });
  };

  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card p-5">
      <span className="flex gap-3">
        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>
          <span className="block font-semibold">{c.weeklyTitle}</span>
          <span className="block text-sm text-muted-foreground">
            {c.weeklyDesc}
          </span>
        </span>
      </span>
      <Switch checked={on} onCheckedChange={set} aria-label={c.weeklyTitle} />
    </label>
  );
}
