import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type EarningsSummary = {
  available_to_withdraw: number;
  pending_settlement: number;
  paid_out_lifetime: number;
  lifetime_net: number;
};

export type Payout = {
  id: string;
  psychologist_id: string;
  period_start: string;
  period_end: string;
  gross_mad: number;
  platform_fee_mad: number;
  net_mad: number;
  status: "pending" | "processing" | "paid" | "failed";
  paid_at: string | null;
  payout_method: string | null;
  reference: string | null;
  created_at: string;
};

export const useEarningsSummary = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["earnings-summary", user?.id],
    queryFn: async (): Promise<EarningsSummary> => {
      const { data, error } = await supabase.rpc(
        "get_specialist_earnings_summary"
      );
      if (error) throw error;
      return data as EarningsSummary;
    },
    enabled: !!user,
  });
};

export const usePayouts = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["specialist-payouts", user?.id],
    queryFn: async (): Promise<Payout[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("specialist_payouts")
        .select("*")
        .eq("psychologist_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as Payout[];
    },
    enabled: !!user,
  });
};