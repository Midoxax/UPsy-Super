import { useQuery } from "@tanstack/react-query";
import {
  searchPsychologists,
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
  return useQuery({
    queryKey: ["psychologists", filters, near, query, sort, page, pageSize],
    queryFn: () =>
      searchPsychologists({ filters, near, query, sort, page, pageSize }),
    placeholderData: (prev) => prev,
    enabled,
  });
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
