import { useQuery } from "@tanstack/react-query";
import {
  searchPsychologists,
  fetchSpecialties,
  fetchLanguages,
  fetchTherapyApproaches,
} from "@/services/psychologistsService";
import type { SortOption } from "@/services/psychologistsService";
import type { FilterState } from "@/types/psychologist";

interface UsePsychologistsParams {
  filters: FilterState;
  query?: string;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export const usePsychologists = ({
  filters,
  query = "",
  sort = "recommended",
  page = 1,
  pageSize = 12,
}: UsePsychologistsParams) => {
  return useQuery({
    queryKey: ["psychologists", filters, query, sort, page, pageSize],
    queryFn: () =>
      searchPsychologists({ filters, query, sort, page, pageSize }),
    placeholderData: (prev) => prev,
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
