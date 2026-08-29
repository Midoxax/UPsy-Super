import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type MembershipTier =
  | "discover"
  | "student"
  | "athlete"
  | "coach"
  | "practitioner"
  | "organization"
  | "elite";

const TIER_RANK: Record<MembershipTier, number> = {
  discover: 0,
  student: 1,
  athlete: 2,
  coach: 2,
  practitioner: 3,
  organization: 4,
  elite: 5,
};

export interface MembershipPlan {
  tier: MembershipTier;
  name: string;
  tagline: string | null;
  price_monthly_mad: number;
  price_annual_mad: number;
  features: Record<string, unknown>;
  sort_order: number;
}

export interface UserMembership {
  id: string;
  user_id: string;
  tier: MembershipTier;
  status: string;
  billing_cycle: "monthly" | "annual";
  current_period_end: string | null;
}

export const useMembershipPlans = () =>
  useQuery({
    queryKey: ["membership-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membership_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as unknown as MembershipPlan[];
    },
    staleTime: 5 * 60_000,
  });

export const useMyMemberships = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-memberships", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_memberships")
        .select("*")
        .eq("status", "active");
      if (error) throw error;
      return (data ?? []) as unknown as UserMembership[];
    },
    staleTime: 60_000,
  });
};

/** Highest active tier the current user owns, or `discover` if none. */
export const useCurrentTier = (): { tier: MembershipTier; loading: boolean } => {
  const { data, isLoading } = useMyMemberships();
  if (!data || data.length === 0) return { tier: "discover", loading: isLoading };
  const sorted = [...data].sort((a, b) => TIER_RANK[b.tier] - TIER_RANK[a.tier]);
  return { tier: sorted[0].tier, loading: isLoading };
};

export const hasTier = (owned: MembershipTier, required: MembershipTier) =>
  TIER_RANK[owned] >= TIER_RANK[required];

export const TIER_LABEL: Record<MembershipTier, string> = {
  discover: "Discover",
  student: "Student",
  athlete: "Athlete",
  coach: "Coach",
  practitioner: "Practitioner",
  organization: "Organization",
  elite: "Elite",
};