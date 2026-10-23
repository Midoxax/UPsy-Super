// Route loaders for content-backed pages. One shared module, so each route
// adds one call to the first download instead of its own lazy-import code;
// the content data itself loads only when one of these pages is visited.
import { notFound } from "@tanstack/react-router";
import { localPsychologists } from "./localPsychologists";

export const blogLoader = async (slug: string) =>
  (await import("./content")).blogLoader(slug);

// In the loader so the nearest psychologists are in the server HTML.
export async function cityLoader(slug: string) {
  const [{ CITIES }, { citySeo }] = await Promise.all([
    import("@/content/seo/places"),
    import("./content"),
  ]);
  const city = CITIES.find((c) => c.slug === slug);
  if (!city) throw notFound();
  return { city, list: await localPsychologists(city), seo: citySeo(city) };
}

export async function countryLoader(slug: string) {
  const [{ COUNTRIES }, { countrySeo }] = await Promise.all([
    import("@/content/seo/places"),
    import("./content"),
  ]);
  const country = COUNTRIES.find((c) => c.slug === slug);
  if (!country) throw notFound();
  return {
    country,
    list: await localPsychologists({ online: true }),
    seo: countrySeo(country),
  };
}
