/**
 * Office map for in-person sessions: OpenStreetMap's embed (a plain iframe,
 * free, no key). Shown only when the psychologist has pinned their office;
 * with a city alone the city name on the profile says as much as a map.
 */
interface LocationMapProps {
  city: string;
  officeLat?: number | null;
  officeLng?: number | null;
}

export function LocationMap({ city, officeLat, officeLng }: LocationMapProps) {
  if (officeLat == null || officeLng == null) return null;
  const d = 0.006;
  const bbox = [
    officeLng - d,
    officeLat - d,
    officeLng + d,
    officeLat + d,
  ].join(",");

  return (
    <div className="space-y-1">
      <iframe
        title={`Map of ${city}`}
        className="w-full h-56 rounded-xl border border-border"
        loading="lazy"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${officeLat},${officeLng}`}
      />
      <a
        className="text-xs text-muted-foreground underline"
        href={`https://www.openstreetmap.org/?mlat=${officeLat}&mlon=${officeLng}#map=17/${officeLat}/${officeLng}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        © OpenStreetMap · open larger map
      </a>
    </div>
  );
}
