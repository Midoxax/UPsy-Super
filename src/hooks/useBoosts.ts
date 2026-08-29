import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type BoostType = "spotlight" | "search_boost" | "homepage_feature";

export interface BoostPackage {
  id: BoostType;
  name: string;
  description: string;
  durationDays: number;
  priceMad: number;
  priceEur: number;
  badge?: string;
}

export const BOOST_CATALOG: BoostPackage[] = [
  {
    id: "search_boost",
    name: "Search Boost",
    description: "Rank higher in directory search results for 7 days.",
    durationDays: 7,
    priceMad: 199,
    priceEur: 19,
  },
  {
    id: "spotlight",
    name: "Spotlight",
    description: "Featured card on the directory + search boost for 7 days.",
    durationDays: 7,
    priceMad: 399,
    priceEur: 39,
    badge: "Most popular",
  },
  {
    id: "homepage_feature",
    name: "Homepage Feature",
    description: "Appear in 'Featured Specialists' on the homepage for 14 days.",
    durationDays: 14,
    priceMad: 899,
    priceEur: 89,
  },
];

export interface ActiveBoost {
  id: string;
  boost_type: string;
  starts_at: string;
  ends_at: string;
  amount_mad: number;
  payment_status: string;
}

export const useActiveBoosts = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["specialist-boosts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("specialist_boosts")
        .select("*")
        .eq("psychologist_id", user.id)
        .order("ends_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as ActiveBoost[];
    },
    enabled: !!user,
  });
};

export const usePurchaseBoost = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pkg: BoostPackage) => {
      if (!user) throw new Error("Not authenticated");
      const now = new Date();
      const ends = new Date(now.getTime() + pkg.durationDays * 86400_000);
      const { data, error } = await supabase
        .from("specialist_boosts")
        .insert({
          psychologist_id: user.id,
          boost_type: pkg.id,
          starts_at: now.toISOString(),
          ends_at: ends.toISOString(),
          amount_mad: pkg.priceMad,
          amount_eur: pkg.priceEur,
          payment_status: "paid",
          metadata: { mock: true, package_name: pkg.name },
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["specialist-boosts"] });
      qc.invalidateQueries({ queryKey: ["psychologist-profile"] });
    },
  });
};
