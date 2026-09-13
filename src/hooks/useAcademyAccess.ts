import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type AcademyPlan = "monthly" | "yearly";

export interface AllAccessSubscription {
  id: string;
  status: string;
  billing_cycle: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

/** Reads the caller's own all-access row. Entitlement itself is decided
 * server-side by public.has_all_access() wherever it matters (RLS on
 * premium content, edge functions) — this is for rendering the paywall UI. */
export const useAcademyAccess = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["academy-subscription", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("all_access_subscriptions")
        .select(
          "id, status, billing_cycle, current_period_end, cancel_at_period_end",
        )
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as AllAccessSubscription | null;
    },
  });

  const hasAccess =
    !!query.data &&
    ["active", "trialing"].includes(query.data.status) &&
    new Date(query.data.current_period_end) > new Date();

  return { ...query, subscription: query.data ?? null, hasAccess };
};

export const useStartAcademyCheckout = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (plan: AcademyPlan) => {
      if (!user) throw new Error("Sign in to join the Academy");
      const { data, error } = await supabase.functions.invoke(
        "create-academy-checkout",
        {
          body: { plan },
        },
      );
      if (error) throw error;
      if (!data?.url) throw new Error("Could not start checkout");
      return data.url as string;
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not start checkout");
    },
  });
};
