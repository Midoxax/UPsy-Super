import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

export interface AddressSelection {
  address: string;
  lat: number | null;
  lng: number | null;
}

/** Loaded once per page; concurrent callers share the same in-flight promise. */
let placesLoader: Promise<void> | null = null;

function loadPlacesLibrary(): Promise<void> {
  if (placesLoader) return placesLoader;
  placesLoader = new Promise((resolve, reject) => {
    if ((window as any).google?.maps?.places) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps JS API"));
    document.head.appendChild(script);
  });
  return placesLoader;
}

/**
 * Address input with Google Places Autocomplete. Degrades to a plain text
 * field — same value, no suggestions — when no API key is configured or the
 * script fails to load; a broken autocomplete widget is worse than a plain
 * input that just takes free text.
 */
export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (selection: AddressSelection) => void;
  placeholder?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!MAPS_API_KEY || !inputRef.current) return;
    // No @types/google.maps dependency — the runtime object is typed `any`
    // rather than pulling in a package just for these method signatures.
    let maps: any;
    let autocomplete: any;
    let cancelled = false;

    loadPlacesLibrary()
      .then(() => {
        if (cancelled || !inputRef.current) return;
        maps = (window as any).google.maps;
        autocomplete = new maps.places.Autocomplete(inputRef.current, {
          fields: ["formatted_address", "geometry"],
        });
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          const address = place.formatted_address ?? inputRef.current!.value;
          onChange(address);
          onSelect?.({
            address,
            lat: place.geometry?.location?.lat() ?? null,
            lng: place.geometry?.location?.lng() ?? null,
          });
        });
      })
      .catch(() => {
        // No-op: field stays a plain text input.
      });

    return () => {
      cancelled = true;
      if (autocomplete) maps?.event.clearInstanceListeners(autocomplete);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- autocomplete is bound once per mount
  }, []);

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      autoComplete="off"
    />
  );
}
