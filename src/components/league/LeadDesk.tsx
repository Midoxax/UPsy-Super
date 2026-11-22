import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { useEngagementCopy } from "@/lib/league/engagementCopy";
import ParticipationDesk from "./ParticipationDesk";

/** For division leads (not League accounts): validate and rate members. */
export default function LeadDesk() {
  const { user } = useAuth();
  const { t } = useEngagementCopy();
  const { data: isLead } = useQuery({
    queryKey: ["league-lead", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("league_division_leads")
        .select("division_id")
        .eq("user_id", user!.id)
        .limit(1);
      return (data ?? []).length > 0;
    },
  });
  if (!isLead) return null;
  return (
    <Card className="p-5 space-y-4">
      <h3 className="font-semibold">{t.participation}</h3>
      <ParticipationDesk mode="lead" />
    </Card>
  );
}
