import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SubscriptionInvoice {
  id: string;
  invoice_number: string | null;
  plan_type: string;
  amount_mad: number;
  status: string;
  paid_at: string | null;
  period_start: string;
  period_end: string;
  created_at: string;
}

export const useSubscriptionInvoices = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["subscription-invoices", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("subscription_invoices" as any)
        .select("*")
        .eq("psychologist_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as SubscriptionInvoice[];
    },
    enabled: !!user,
  });
};

/**
 * Mock checkout — creates a paid invoice and flips the subscription plan.
 * Replace with a Stripe Checkout call when payments are activated.
 */
export const useChangePlanMock = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      planId,
      amountMad,
    }: {
      planId: "free" | "pro" | "elite";
      amountMad: number;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // 1. upsert subscription
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const { error: subErr } = await supabase
        .from("subscriptions")
        .upsert(
          {
            psychologist_id: user.id,
            plan_type: planId,
            status: "active",
            starts_at: now.toISOString(),
          },
          { onConflict: "psychologist_id" },
        );
      if (subErr) throw subErr;

      // 2. create invoice (skip for free)
      if (planId !== "free" && amountMad > 0) {
        const { error: invErr } = await supabase
          .from("subscription_invoices" as any)
          .insert({
            psychologist_id: user.id,
            plan_type: planId,
            amount_mad: amountMad,
            status: "paid",
            paid_at: now.toISOString(),
            period_start: now.toISOString().slice(0, 10),
            period_end: periodEnd.toISOString().slice(0, 10),
            payment_method: "mock_test",
          } as any);
        if (invErr) throw invErr;
      }

      return { planId };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["specialist-plan"] });
      qc.invalidateQueries({ queryKey: ["subscription-invoices"] });
      qc.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
};
