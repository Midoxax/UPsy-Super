import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRecruitmentCopy } from "@/lib/recruitment/recruitmentCopy";
import InvitationCard, {
  type Invitation,
} from "@/components/recruitment/InvitationCard";

/** League portal: every interview, upcoming first. */
export default function InterviewsDesk({
  names,
}: {
  names: Record<string, string>;
}) {
  const { t } = useRecruitmentCopy();
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["league-interviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recruitment_invitations")
        .select("*, recruitment_slots(*)")
        .order("scheduled_at", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Invitation[];
    },
  });
  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin" />;
  if (data.length === 0)
    return <p className="text-sm text-muted-foreground">{t.deskEmpty}</p>;
  return (
    <div className="space-y-3">
      {data.map((inv) => (
        <InvitationCard
          key={inv.id}
          inv={inv}
          side="recruiter"
          counterpart={inv.application_id ? names[inv.application_id] : null}
          onChange={() =>
            qc.invalidateQueries({ queryKey: ["league-interviews"] })
          }
        />
      ))}
    </div>
  );
}
