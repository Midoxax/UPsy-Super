import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import type { NearPoint } from "@/services/psychologistsService";
import type { PsychologistProfile } from "@/types/psychologist";

const MOROCCO: [number, number] = [31.8, -7.1];
// OpenStreetMap tiles: free, no key; the attribution is required.
const TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

/**
 * One pin per in-person psychologist: at their office, or at their city's
 * centre until they add an address (several pins in one city are spread a
 * little so each stays tappable). The visitor's position, when shared, is a
 * blue dot and the map frames it with the nearest pins. Leaflet is loaded
 * only when the map is opened.
 */
export function PsychologistsMap({
  profiles,
  near,
}: {
  profiles: PsychologistProfile[];
  near: NearPoint | null;
}) {
  const { t, locale } = useLocale();
  const el = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const pins = profiles.filter(
    (p) => p.offers_in_person && p.map_lat != null && p.map_lng != null,
  );

  useEffect(() => {
    let cancelled = false;
    let map: import("leaflet").Map | null = null;
    Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")])
      .then(([{ default: L }]) => {
        if (cancelled || !el.current) return;
        map = L.map(el.current, { scrollWheelZoom: false }).setView(
          near ? [near.lat, near.lng] : MOROCCO,
          near ? 11 : 5,
        );
        L.tileLayer(TILES, { maxZoom: 19, attribution: ATTRIBUTION }).addTo(
          map,
        );

        const seen = new Map<string, number>();
        const points: [number, number][] = [];
        for (const p of pins) {
          // Spread profiles that share a city centre around it.
          const key = `${p.map_lat},${p.map_lng}`;
          const n = seen.get(key) ?? 0;
          seen.set(key, n + 1);
          const angle = n * 2.4;
          const r = p.location_precise || n === 0 ? 0 : 0.004 * Math.sqrt(n);
          const pos: [number, number] = [
            p.map_lat! + r * Math.cos(angle),
            p.map_lng! + r * Math.sin(angle),
          ];
          points.push(pos);
          const href = addLocalePrefix(`/psychologists/${p.slug}`, locale);
          const where = p.location_precise
            ? (p.office_address ?? p.city ?? "")
            : `${p.city ?? ""} · ${t("psychologists.cityOnly")}`;
          const km =
            p.distance_km != null ? ` · ${p.distance_km.toFixed(1)} km` : "";
          L.circleMarker(pos, {
            radius: 9,
            color: "#fff",
            weight: 2,
            fillColor: "#7A0C20",
            fillOpacity: 1,
          })
            .bindTooltip(esc(p.full_name))
            .bindPopup(
              `<strong>${esc(p.full_name)}</strong><br/>
               <span style="color:#555">${esc(where)}${esc(km)}</span><br/>
               <a href="${esc(href)}" style="color:#7A0C20;font-weight:600">${esc(t("psychologists.viewProfile"))} →</a>`,
            )
            .addTo(map);
        }

        if (near) {
          L.circleMarker([near.lat, near.lng], {
            radius: 8,
            color: "#fff",
            weight: 2,
            fillColor: "#1a73e8",
            fillOpacity: 1,
          })
            .bindTooltip(t("psychologists.youAreHere"))
            .addTo(map);
          // Frame the visitor with the closest few pins.
          const closest = pins
            .map((p, i) => ({ p, pos: points[i] }))
            .filter(({ p }) => p.distance_km != null)
            .sort((a, b) => a.p.distance_km! - b.p.distance_km!)
            .slice(0, 3)
            .map(({ pos }) => pos);
          if (closest.length)
            map.fitBounds([[near.lat, near.lng], ...closest], {
              padding: [48, 48],
              maxZoom: 14,
            });
        } else if (points.length) {
          map.fitBounds(points, { padding: [48, 48], maxZoom: 12 });
        }
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      map?.remove();
    };
    // Rebuild when the result set or position changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins.map((p) => p.id).join(), near?.lat, near?.lng, locale]);

  if (failed) {
    return (
      <div className="glass-card flex items-center gap-3 p-6 text-sm text-muted-foreground">
        <MapPin className="h-5 w-5 shrink-0" />
        {t("psychologists.mapUnavailable")}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        ref={el}
        className="relative z-0 h-[60vh] min-h-[360px] w-full overflow-hidden rounded-2xl border border-border"
        aria-label={t("psychologists.viewMap")}
        role="region"
      />
      <p className="text-xs text-muted-foreground">
        {t("psychologists.mapLegend").replace("{n}", String(pins.length))}
      </p>
    </div>
  );
}
