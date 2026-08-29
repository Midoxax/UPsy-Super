import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const usePsychologistProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["psychologist-profile", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("psychologist_profiles")
        .select(`
          *,
          psychologist_specialties(
            specialty:specialties(id, name)
          ),
          psychologist_languages(
            language:languages(id, name)
          )
        `)
        .eq("id", user.id)
        .single();

      if (error) throw error;

      return {
        ...data,
        specialties: data.psychologist_specialties?.map((ps: any) => ps.specialty) || [],
        languages: data.psychologist_languages?.map((pl: any) => pl.language) || [],
      };
    },
    enabled: !!user,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: any) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("psychologist_profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["psychologist-profile"] });
    },
  });
};

export const useLeads = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["leads", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("psychologist_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("leads")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};

export const useSubscription = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("psychologist_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};
