import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

export type Membership = Tables<"league_memberships"> & {
  league_membership_plans: Tables<"league_membership_plans"> | null;
};

/**
 * The signed-in user's League membership: the active one (if any), the
 * pending application (if any) and its latest payment.
 */
export function useLeagueMembership() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["league-membership", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("league_memberships")
        .select("*, league_membership_plans(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as Membership[];
      const today = new Date().toISOString().slice(0, 10);
      const active =
        rows.find((m) => m.status === "active" && (m.ends_on ?? "") >= today) ??
        null;
      const pending = rows.find((m) => m.status === "pending") ?? null;
      let payment: Tables<"league_payments"> | null = null;
      if (pending) {
        const { data: p } = await supabase
          .from("league_payments")
          .select("*")
          .eq("membership_id", pending.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        payment = p;
      }
      return { active, pending, payment, isMember: !!active };
    },
  });
}
