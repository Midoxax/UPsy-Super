import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Which of these psychologist profiles belong to a confirmed LSSPM member. */
export function useLeagueBadges(ids: string[]) {
  const key = [...new Set(ids)].sort();
  const { data } = useQuery({
    queryKey: ["league-badges", key],
    enabled: key.length > 0,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("league_member_badges", {
        _ids: key,
      });
      if (error) throw error;
      return new Set<string>((data ?? []) as string[]);
    },
  });
  return data ?? new Set<string>();
}
