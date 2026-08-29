import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProvisioningAttempt {
  id: string;
  application_id: string;
  admin_user_id: string | null;
  user_id: string | null;
  status: "success" | "failure" | "partial";
  reused_existing_user: boolean;
  already_provisioned: boolean;
  error_code: string | null;
  error_message: string | null;
  duration_ms: number | null;
  steps: Array<{ step: string; ok: boolean; ms: number; skipped?: boolean; error?: string }>;
  created_at: string;
}

export function useProvisioningAttempts(applicationId?: string) {
  return useQuery({
    queryKey: ["provisioning-attempts", applicationId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("provisioning_attempts" as any).select("*").order("created_at", { ascending: false });
      if (applicationId) q = q.eq("application_id", applicationId);
      const { data, error } = await q.limit(100);
      if (error) throw error;
      return (data || []) as unknown as ProvisioningAttempt[];
    },
  });
}

export function useProvisioningInspect(applicationId?: string) {
  return useQuery({
    queryKey: ["provisioning-inspect", applicationId],
    enabled: !!applicationId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("inspect_provisioning_state" as any, { _application_id: applicationId });
      if (error) throw error;
      return data as any;
    },
  });
}