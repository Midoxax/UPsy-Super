/**
 * Google Maps JS API, loaded once per page with the places library (the
 * address field and the psychologists map share it). No @types/google.maps:
 * callers treat the runtime object as `any` rather than pulling in a
 * package for a few method signatures.
 */
export const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as
  string | undefined;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
export type GoogleMaps = any;

let loader: Promise<GoogleMaps> | null = null;

export function loadGoogleMaps(): Promise<GoogleMaps> {
  if (!MAPS_API_KEY) return Promise.reject(new Error("No Maps API key"));
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    const w = window as unknown as {
      google?: { maps?: GoogleMaps };
      __upsyMapsReady?: () => void;
    };
    if (w.google?.maps?.places) return resolve(w.google.maps);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places&callback=__upsyMapsReady`;
    script.async = true;
    w.__upsyMapsReady = () => resolve(w.google?.maps);
    script.onerror = () => {
      loader = null;
      reject(new Error("Failed to load Google Maps JS API"));
    };
    document.head.appendChild(script);
  });
  return loader;
}
