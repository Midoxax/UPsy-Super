/**
 * A Supabase Storage image at the size it is shown, as WebP or AVIF.
 *
 * Specialists upload photos straight from their phones (one is a 1.2 MB PNG
 * shown in a 64 px circle). Storage's image endpoint resizes and re-encodes on
 * the fly: the same photo at 480 px is about 7 KB. Non-Storage URLs are
 * returned unchanged.
 */
export function photoUrl(
  url: string | null | undefined,
  size: number,
): string | undefined {
  if (!url) return undefined;
  const marker = "/storage/v1/object/public/";
  if (!url.includes(".supabase.co" + marker)) return url;
  const px = Math.round(size * 2); // sharp on high-density screens
  return (
    url.replace(marker, "/storage/v1/render/image/public/") +
    `${url.includes("?") ? "&" : "?"}width=${px}&height=${px}&resize=cover&quality=70`
  );
}
