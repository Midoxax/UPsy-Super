/**
 * Map for in-person sessions, via the Maps Embed API (a plain iframe — no
 * JS SDK, no script-src change, no per-load billing beyond the embed's own
 * free tier). Renders nothing when no key is configured, same
 * opt-in-until-proven pattern as src/config/auth.ts: a broken map is worse
 * than no map.
 *
 * Prefers the psychologist's precise office coordinates (set via
 * AddressAutocomplete in the admin edit drawer) and falls back to a
 * city-level view when only `city` is on file.
 */
const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

interface LocationMapProps {
  city: string;
  officeLat?: number | null;
  officeLng?: number | null;
}

export function LocationMap({ city, officeLat, officeLng }: LocationMapProps) {
  if (!MAPS_API_KEY) return null;

  const hasCoords = officeLat != null && officeLng != null;
  const query = hasCoords ? `${officeLat},${officeLng}` : encodeURIComponent(`${city}, Morocco`);
  const zoom = hasCoords ? 15 : 12;

  return (
    <iframe
      title={`Map of ${city}`}
      className="w-full h-56 rounded-xl border border-border"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      src={`https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=${query}&zoom=${zoom}`}
    />
  );
}
