import { supabase } from "@/integrations/supabase/client";
import type { FilterState, PsychologistProfile } from "@/types/psychologist";

interface SearchParams {
  filters: FilterState;
  page?: number;
  pageSize?: number;
}

interface SearchResult {
  profiles: PsychologistProfile[];
  total: number;
  page: number;
  pageSize: number;
}

export const searchPsychologists = async ({
  filters,
  page = 1,
  pageSize = 12,
}: SearchParams): Promise<SearchResult> => {
  const { data, error } = await supabase.rpc("search_psychologists", {
    p_specialties: filters.specialties.length > 0 ? filters.specialties : [],
    p_languages: filters.languages.length > 0 ? filters.languages : [],
    p_therapy_approaches: filters.therapyApproaches.length > 0 ? filters.therapyApproaches : [],
    p_city: filters.city || undefined,
    p_online: filters.online || undefined,
    p_in_person: filters.inPerson || undefined,
    p_gender: filters.gender || undefined,
    p_availability: filters.availability || undefined,
    p_min_price: filters.minPrice,
    p_max_price: filters.maxPrice,
    p_page: page,
    p_page_size: pageSize,
  });

  if (error) throw error;

  const total = data && data.length > 0 ? Number(data[0].total_count) : 0;
  const profileIds = data?.map((p: any) => p.id) || [];

  if (profileIds.length === 0) {
    return { profiles: [], total: 0, page, pageSize };
  }

  const [specialtiesData, languagesData, approachesData] = await Promise.all([
    supabase
      .from("psychologist_specialties")
      .select("psychologist_id, specialty:specialties(id, name)")
      .in("psychologist_id", profileIds),
    supabase
      .from("psychologist_languages")
      .select("psychologist_id, language:languages(id, name)")
      .in("psychologist_id", profileIds),
    supabase
      .from("psychologist_therapy_approaches")
      .select("psychologist_id, therapy_approach:therapy_approaches(id, name)")
      .in("psychologist_id", profileIds),
  ]);

  if (specialtiesData.error) throw specialtiesData.error;
  if (languagesData.error) throw languagesData.error;
  if (approachesData.error) throw approachesData.error;

  // Plan-based ranking boost: pull active subscriptions for these profiles
  const { data: subsData } = await supabase
    .from("subscriptions")
    .select("psychologist_id, plan_type, status")
    .in("psychologist_id", profileIds)
    .eq("status", "active");

  const planRank = new Map<string, number>();
  (subsData ?? []).forEach((s: any) => {
    const tier =
      s.plan_type === "elite" || s.plan_type === "premium" ? 3 :
      s.plan_type === "pro" || s.plan_type === "basic" ? 2 : 1;
    planRank.set(s.psychologist_id, tier);
  });

  const buildMap = (items: any[], key: string) => {
    const map = new Map<string, any[]>();
    items?.forEach((item: any) => {
      if (!map.has(item.psychologist_id)) map.set(item.psychologist_id, []);
      map.get(item.psychologist_id)!.push(item[key]);
    });
    return map;
  };

  const specialtiesMap = buildMap(specialtiesData.data || [], "specialty");
  const languagesMap = buildMap(languagesData.data || [], "language");
  const approachesMap = buildMap(approachesData.data || [], "therapy_approach");

  const profilesUnranked: PsychologistProfile[] = (data || []).map((profile: any) => {
    const { total_count, ...profileData } = profile;
    return {
      ...profileData,
      specialties: specialtiesMap.get(profile.id) || [],
      languages: languagesMap.get(profile.id) || [],
      therapy_approaches: approachesMap.get(profile.id) || [],
      _plan_rank: planRank.get(profile.id) ?? 1,
    };
  });

  // Stable sort: higher plan tier first, preserve underlying order otherwise.
  const profiles = profilesUnranked
    .map((p, i) => ({ p, i }))
    .sort((a, b) => {
      const ra = (a.p as any)._plan_rank ?? 1;
      const rb = (b.p as any)._plan_rank ?? 1;
      if (rb !== ra) return rb - ra;
      return a.i - b.i;
    })
    .map(({ p }) => {
      const { _plan_rank, ...clean } = p as any;
      return clean as PsychologistProfile;
    });

  return { profiles, total, page, pageSize };
};

export const getFeaturedPsychologists = async (limit = 4) => {
  // Pull a wider pool, then sort: Elite > Pro > Free, recency as tiebreaker.
  const poolSize = Math.max(limit * 5, 20);
  const { data, error } = await supabase
    .from("psychologist_profiles")
    .select(`
      id, full_name, bio, photo_url, city, slug, hourly_rate_mad,
      offers_online, offers_in_person,
      psychologist_specialties(specialty_id, specialties(name)),
      psychologist_languages(language_id, languages(name))
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(poolSize);

  if (error) throw error;
  const pool = data ?? [];
  if (pool.length === 0) return [];

  const ids = pool.map((p: any) => p.id);
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("psychologist_id, plan_type, status")
    .in("psychologist_id", ids)
    .eq("status", "active");

  const tier = new Map<string, number>();
  (subs ?? []).forEach((s: any) => {
    const r =
      s.plan_type === "elite" || s.plan_type === "premium" ? 3 :
      s.plan_type === "pro" || s.plan_type === "basic" ? 2 : 1;
    tier.set(s.psychologist_id, r);
  });

  return pool
    .map((p: any, i: number) => ({ p, i, t: tier.get(p.id) ?? 1 }))
    .sort((a, b) => (b.t - a.t) || (a.i - b.i))
    .slice(0, limit)
    .map(({ p }) => p);
};

export const fetchSpecialties = async () => {
  const { data, error } = await supabase.from("specialties").select("*").order("name");
  if (error) throw error;
  return data;
};

export const fetchLanguages = async () => {
  const { data, error } = await supabase.from("languages").select("*").order("name");
  if (error) throw error;
  return data;
};

export const fetchTherapyApproaches = async () => {
  const { data, error } = await supabase.from("therapy_approaches").select("*").order("name");
  if (error) throw error;
  return data;
};
