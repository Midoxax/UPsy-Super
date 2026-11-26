import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  rankPsychologists,
  fetchTaxonomy,
  withTaxonomy,
  fetchSpecialties,
  fetchLanguages,
  fetchTherapyApproaches,
} from "@/services/psychologistsService";
import type { NearPoint, SortOption } from "@/services/psychologistsService";
import type { FilterState } from "@/types/psychologist";

interface UsePsychologistsParams {
  filters: FilterState;
  near?: NearPoint | null;
  query?: string;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

export const usePsychologists = ({
  filters,
  near = null,
  query = "",
  sort = "recommended",
  page = 1,
  pageSize = 12,
  enabled = true,
}: UsePsychologistsParams) => {
  // The cards show as soon as the ranking arrives; their specialty, language
  // and approach names follow in a second request instead of holding them.
  const ranked = useQuery({
    queryKey: ["psychologists", filters, near, query, sort, page, pageSize],
    queryFn: () =>
      rankPsychologists({ filters, near, query, sort, page, pageSize }),
    placeholderData: (prev) => prev,
    enabled,
  });
  const ids = useMemo(
    () => ranked.data?.profiles.map((p) => p.id) ?? [],
    [ranked.data],
  );
  const taxonomy = useQuery({
    queryKey: ["psychologist_taxonomy", ids],
    queryFn: () => fetchTaxonomy(ids),
    placeholderData: (prev) => prev,
    enabled: enabled && ids.length > 0,
    staleTime: 5 * 60_000,
  });
  const data = useMemo(
    () =>
      ranked.data && {
        ...ranked.data,
        profiles: withTaxonomy(ranked.data.profiles, taxonomy.data),
      },
    [ranked.data, taxonomy.data],
  );
  return { data, isLoading: ranked.isLoading };
};

export const useSpecialties = () => {
  return useQuery({
    queryKey: ["specialties"],
    queryFn: fetchSpecialties,
  });
};

export const useLanguages = () => {
  return useQuery({
    queryKey: ["languages"],
    queryFn: fetchLanguages,
  });
};

export const useTherapyApproaches = () => {
  return useQuery({
    queryKey: ["therapy_approaches"],
    queryFn: fetchTherapyApproaches,
  });
};
