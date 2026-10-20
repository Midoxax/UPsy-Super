import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type {
  FilterState,
  Language,
  PsychologistProfile,
  Specialty,
  TherapyApproach,
} from "@/types/psychologist";

interface SearchParams {
  filters: FilterState;
  query?: string;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export type SortOption =
  "recommended" | "soonest" | "rating" | "price_asc" | "price_desc";

interface SearchResult {
  profiles: PsychologistProfile[];
  total: number;
  page: number;
  pageSize: number;
}

// Price slider bounds; the full range means "no price filter", so profiles
// without a published rate are not hidden.
export const PRICE_MIN = 0;
export const PRICE_MAX = 2000;

/** Ranking happens in the database (rank_psychologists); this adds the
 *  specialty, language and approach names for the cards. */
export const searchPsychologists = async ({
  filters,
  query,
  sort = "recommended",
  page = 1,
  pageSize = 12,
}: SearchParams): Promise<SearchResult> => {
  const { data, error } = await supabase.rpc("rank_psychologists", {
    p_query: query?.trim() || undefined,
    p_specialties: filters.specialties,
    p_languages: filters.languages,
    p_therapy_approaches: filters.therapyApproaches,
    p_city: filters.city || undefined,
    p_online: filters.online || undefined,
    p_in_person: filters.inPerson || undefined,
    p_gender: filters.gender || undefined,
    p_availability: filters.availability || undefined,
    p_min_price: filters.minPrice > PRICE_MIN ? filters.minPrice : undefined,
    p_max_price: filters.maxPrice < PRICE_MAX ? filters.maxPrice : undefined,
    p_sort: sort,
    p_page: page,
    p_page_size: pageSize,
  });
  if (error) throw error;

  const rows = data ?? [];
  const total = rows.length > 0 ? Number(rows[0].total_count) : 0;
  const profiles = await withTaxonomy(rows);
  return { profiles, total, page, pageSize };
};

type RankedRow =
  Database["public"]["Functions"]["rank_psychologists"]["Returns"][number];

async function withTaxonomy(rows: RankedRow[]): Promise<PsychologistProfile[]> {
  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return [];
  const [specialtiesData, languagesData, approachesData] = await Promise.all([
    supabase
      .from("psychologist_specialties")
      .select("psychologist_id, specialty:specialties(id, name)")
      .in("psychologist_id", ids),
    supabase
      .from("psychologist_languages")
      .select("psychologist_id, language:languages(id, name)")
      .in("psychologist_id", ids),
    supabase
      .from("psychologist_therapy_approaches")
      .select("psychologist_id, therapy_approach:therapy_approaches(id, name)")
      .in("psychologist_id", ids),
  ]);
  if (specialtiesData.error) throw specialtiesData.error;
  if (languagesData.error) throw languagesData.error;
  if (approachesData.error) throw approachesData.error;

  const group = <T>(items: { psychologist_id: string }[], key: string) => {
    const map = new Map<string, T[]>();
    for (const item of items) {
      const v = (item as Record<string, unknown>)[key] as T | null;
      if (!v) continue;
      map.set(item.psychologist_id, [
        ...(map.get(item.psychologist_id) ?? []),
        v,
      ]);
    }
    return map;
  };
  const specialties = group<Specialty>(specialtiesData.data ?? [], "specialty");
  const languages = group<Language>(languagesData.data ?? [], "language");
  const approaches = group<TherapyApproach>(
    approachesData.data ?? [],
    "therapy_approach",
  );

  return rows.map(({ total_count: _total, score: _score, ...r }) => ({
    ...r,
    office_address: null,
    office_lat: null,
    office_lng: null,
    is_published: true,
    rating_avg: r.rating_avg === null ? null : Number(r.rating_avg),
    rating_count: Number(r.rating_count ?? 0),
    specialties: specialties.get(r.id) ?? [],
    languages: languages.get(r.id) ?? [],
    therapy_approaches: approaches.get(r.id) ?? [],
  }));
}

/** Homepage: the top of the same ranking. */
export const getFeaturedPsychologists = async (limit = 4) => {
  const { data, error } = await supabase.rpc("rank_psychologists", {
    p_page_size: limit,
  });
  if (error) throw error;
  const ids = (data ?? []).map((r) => r.id);
  if (ids.length === 0) return [];
  const { data: rows, error: e2 } = await supabase
    .from("psychologist_profiles")
    .select(
      `
      id, full_name, bio, photo_url, city, slug, hourly_rate_mad,
      offers_online, offers_in_person,
      psychologist_specialties(specialty_id, specialties(name)),
      psychologist_languages(language_id, languages(name))
    `,
    )
    .in("id", ids);
  if (e2) throw e2;
  const order = new Map(ids.map((id, i) => [id, i]));
  return (rows ?? []).sort(
    (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
  );
};

export const fetchSpecialties = async () => {
  const { data, error } = await supabase
    .from("specialties")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
};

export const fetchLanguages = async () => {
  const { data, error } = await supabase
    .from("languages")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
};

export const fetchTherapyApproaches = async () => {
  const { data, error } = await supabase
    .from("therapy_approaches")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
};
