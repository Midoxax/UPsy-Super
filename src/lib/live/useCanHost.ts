import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/** Whether the signed-in user may run live classes (admin or specialist). */
export function useCanHost() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["can-host-live", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.rpc("can_host_live_classes", {
        _uid: user!.id,
      });
      return data === true;
    },
  });
}
