import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PlatformPricing = {
  id: string;
  commission_rate: number;
  deposit_percentage: number;
  vat_rate: number;
  min_session_price_mad: number;
  max_session_price_mad: number;
  currency: string;
  notes: string | null;
  is_active: boolean;
  updated_at: string;
};

export const usePlatformPricing = () =>
  useQuery({
    queryKey: ["platform-pricing-active"],
    queryFn: async (): Promise<PlatformPricing | null> => {
      const { data, error } = await supabase
        .from("platform_pricing_config")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return (data as PlatformPricing) ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });

/**
 * Compute deposit, balance, commission, VAT and net amounts from a session price
 * using the active platform pricing config.
 */
export const computeSessionAmounts = (
  sessionPriceMad: number,
  pricing: PlatformPricing
) => {
  const deposit = +(sessionPriceMad * (pricing.deposit_percentage / 100)).toFixed(2);
  const balance = +(sessionPriceMad - deposit).toFixed(2);
  const commission = +(sessionPriceMad * (pricing.commission_rate / 100)).toFixed(2);
  const vat = +(commission * (pricing.vat_rate / 100)).toFixed(2);
  const psychologistNet = +(sessionPriceMad - commission).toFixed(2);
  return { deposit, balance, commission, vat, psychologistNet };
};