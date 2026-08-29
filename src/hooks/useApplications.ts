import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Application {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  qualifications: string | null;
  accreditation_number: string | null;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useApplications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("psychologist_applications")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      return data as Application[];
    },
  });

  const approveApplication = useMutation({
    mutationFn: async ({ applicationId }: { applicationId: string; adminUserId?: string }) => {
      const { data, error } = await supabase.functions.invoke("provision-psychologist", {
        body: { applicationId },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Provisioning failed");

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast({
        title: "Success",
        description: "Psychologist provisioned successfully. Welcome email sent.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectApplication = useMutation({
    mutationFn: async ({
      applicationId,
      reason,
    }: {
      applicationId: string;
      adminUserId?: string;
      reason?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("send-rejection-email", {
        body: { applicationId, reason },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Rejection failed");

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast({
        title: "Success",
        description: "Application rejected. Email sent to applicant.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    applications,
    isLoading,
    approveApplication,
    rejectApplication,
  };
};
