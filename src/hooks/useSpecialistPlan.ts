import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PlanId = "free" | "pro" | "elite";

export interface SpecialistPlan {
  id: PlanId;
  name: string;
  tagline: string | null;
  monthly_price_mad: number;
  commission_rate: number;
  features: Record<string, boolean | number>;
  sort_order: number;
  is_active: boolean;
}

const FALLBACK_FREE: SpecialistPlan = {
  id: "free",
  name: "Free",
  tagline: "Get listed and start receiving clients",
  monthly_price_mad: 0,
  commission_rate: 0.2,
  features: {},
  sort_order: 1,
  is_active: true,
};

/** Current authenticated specialist's effective plan */
export const useSpecialistPlan = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["specialist-plan", user?.id],
    queryFn: async () => {
      if (!user) return FALLBACK_FREE;
      const { data, error } = await supabase.rpc("get_specialist_plan" as any, {
        _user_id: user.id,
      });
      if (error) throw error;
      return ((data as unknown) as SpecialistPlan) ?? FALLBACK_FREE;
    },
    enabled: !!user,
    staleTime: 60_000,
  });
};

/**
 * All active plans, ordered for pricing pages.
 * Reads from the commission-free `specialist_plans_public` view — only admins
 * can read commission_rate via the underlying table directly.
 */
export const useAllPlans = () =>
  useQuery({
    queryKey: ["specialist-plans-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialist_plans_public" as any)
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as unknown as SpecialistPlan[];
    },
    staleTime: 5 * 60_000,
  });

/**
 * Public-safe plan list (no commission_rate). Use on anonymous marketing pages
 * — the underlying view excludes the business-sensitive commission column.
 */
export const useAllPlansPublic = () =>
  useQuery({
    queryKey: ["specialist-plans-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialist_plans_public" as any)
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as unknown as SpecialistPlan[];
    },
    staleTime: 5 * 60_000,
  });

/** Boolean helper for any feature key */
export const hasFeature = (
  plan: SpecialistPlan | undefined,
  feature: string,
): boolean => {
  if (!plan) return false;
  const v = plan.features?.[feature];
  return typeof v === "boolean" ? v : Boolean(v);
};

export const useHasFeature = (feature: string) => {
  const { data: plan, isLoading } = useSpecialistPlan();
  return { has: hasFeature(plan, feature), plan, isLoading };
};
