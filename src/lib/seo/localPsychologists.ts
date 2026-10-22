import { supabase } from "@/integrations/supabase/client";

export interface LocalPsychologist {
  id: string;
  slug: string | null;
  full_name: string;
  city: string | null;
  photo_url: string | null;
  hourly_rate_mad: number | null;
  offers_online: boolean | null;
  offers_in_person: boolean | null;
  is_accredited: boolean | null;
  rating_avg: number | null;
  rating_count: number | null;
  distance_km: number | null;
}

/** Psychologists for a landing page, fetched in the route loader so they are
 *  in the server HTML. Nearest first for a city; online ones for a country.
 *  Never throws: a failed fetch leaves the list empty, not the page broken. */
export async function localPsychologists(
  opts: { lat: number; lng: number } | { online: true },
): Promise<LocalPsychologist[]> {
  try {
    const { data, error } = await supabase.rpc("rank_psychologists", {
      p_sort: "lat" in opts ? "nearest" : "recommended",
      p_page_size: 6,
      ...("lat" in opts
        ? { p_near_lat: opts.lat, p_near_lng: opts.lng }
        : { p_online: true }),
    });
    if (error) return [];
    return (data ?? []).map((r) => ({
      id: r.id,
      slug: r.slug,
      full_name: r.full_name,
      city: r.city,
      photo_url: r.photo_url,
      hourly_rate_mad: r.hourly_rate_mad,
      offers_online: r.offers_online,
      offers_in_person: r.offers_in_person,
      is_accredited: r.is_accredited,
      rating_avg: r.rating_avg,
      rating_count: r.rating_count,
      distance_km: r.distance_km,
    }));
  } catch {
    return [];
  }
}
