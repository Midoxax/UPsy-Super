import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PsychologistProfile } from "@/types/psychologist";

export const usePsychologistProfile = (slugOrId: string) => {
  return useQuery({
    queryKey: ["psychologist", slugOrId],
    queryFn: async () => {
      // Try to fetch by slug first, then by ID as fallback
      let query = supabase
        .from("psychologist_profiles")
        .select(`
          *,
          psychologist_specialties(
            specialty:specialties(id, name)
          ),
          psychologist_languages(
            language:languages(id, name)
          ),
          psychologist_therapy_approaches(
            therapy_approach:therapy_approaches(id, name)
          )
        `)
        .eq("is_published", true);

      // Check if it looks like a UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
      
      if (isUUID) {
        query = query.eq("id", slugOrId);
      } else {
        query = query.eq("slug", slugOrId);
      }

      const { data, error } = await query.single();

      if (error) throw error;
      if (!data) throw new Error("Psychologist not found");

      // Transform data to match PsychologistProfile interface
      const profile = {
        ...data,
        specialties: data.psychologist_specialties?.map((ps: any) => ps.specialty).filter(Boolean) || [],
        languages: data.psychologist_languages?.map((pl: any) => pl.language).filter(Boolean) || [],
        therapy_approaches: data.psychologist_therapy_approaches?.map((pt: any) => pt.therapy_approach).filter(Boolean) || [],
      } as unknown as PsychologistProfile;

      return profile;
    },
  });
};
