/**
 * City-level map for in-person sessions, via the Maps Embed API (a plain
 * iframe — no JS SDK, no script-src change, no per-load billing beyond the
 * embed's own free tier). Renders nothing when no key is configured, same
 * opt-in-until-proven pattern as src/config/auth.ts: a broken map is worse
 * than no map.
 */
const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

export function LocationMap({ city }: { city: string }) {
  if (!MAPS_API_KEY) return null;

  const query = encodeURIComponent(`${city}, Morocco`);

  return (
    <iframe
      title={`Map of ${city}`}
      className="w-full h-56 rounded-xl border border-border"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      src={`https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=${query}&zoom=12`}
    />
  );
}
