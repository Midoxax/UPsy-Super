import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useRecruitmentCopy } from "@/lib/recruitment/recruitmentCopy";
import InvitationCard, { type Invitation } from "./InvitationCard";

/** The candidate's interview invitations; renders nothing when there are none. */
export default function CandidateInterviewsCard() {
  const { user } = useAuth();
  const { t } = useRecruitmentCopy();
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["my-interviews", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recruitment_invitations")
        .select("*, recruitment_slots(*)")
        .eq("candidate_id", user!.id)
        .in("status", ["proposed", "scheduled"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Invitation[];
    },
  });
  if (data.length === 0) return null;
  return (
    <section className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        <CalendarClock className="h-4 w-4" /> {t.title}
      </h3>
      {data.map((inv) => (
        <InvitationCard
          key={inv.id}
          inv={inv}
          side="candidate"
          counterpart="LSSPM"
          onChange={() =>
            qc.invalidateQueries({ queryKey: ["my-interviews", user?.id] })
          }
        />
      ))}
    </section>
  );
}
