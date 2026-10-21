import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { addLocalePrefix } from "@/lib/i18n/utils";
import {
  loadGoogleMaps,
  MAPS_API_KEY,
  type GoogleMaps,
} from "@/lib/googleMaps";
import type { NearPoint } from "@/services/psychologistsService";
import type { PsychologistProfile } from "@/types/psychologist";

const MOROCCO = { lat: 31.8, lng: -7.1 };

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
 * blue dot and the map frames it with the nearest pins.
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
    if (!MAPS_API_KEY) return;
    let cancelled = false;
    const markers: GoogleMaps[] = [];
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !el.current) return;
        const map = new maps.Map(el.current, {
          center: near ?? MOROCCO,
          zoom: near ? 11 : 5,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: "cooperative",
        });
        const info = new maps.InfoWindow();
        const bounds = new maps.LatLngBounds();
        const seen = new Map<string, number>();

        for (const p of pins) {
          // Spread profiles that share a city centre around it.
          const key = `${p.map_lat},${p.map_lng}`;
          const n = seen.get(key) ?? 0;
          seen.set(key, n + 1);
          const angle = n * 2.4;
          const r = p.location_precise || n === 0 ? 0 : 0.004 * Math.sqrt(n);
          const pos = {
            lat: p.map_lat! + r * Math.cos(angle),
            lng: p.map_lng! + r * Math.sin(angle),
          };
          const marker = new maps.Marker({
            map,
            position: pos,
            title: p.full_name,
          });
          markers.push(marker);
          bounds.extend(pos);
          const href = addLocalePrefix(`/psychologists/${p.slug}`, locale);
          const where = p.location_precise
            ? (p.office_address ?? p.city ?? "")
            : `${p.city ?? ""} · ${t("psychologists.cityOnly")}`;
          const km =
            p.distance_km != null ? ` · ${p.distance_km.toFixed(1)} km` : "";
          marker.addListener("click", () => {
            info.setContent(
              `<div style="font:14px system-ui;max-width:220px;color:#111">
                 <strong>${esc(p.full_name)}</strong><br/>
                 <span style="color:#555">${esc(where)}${esc(km)}</span><br/>
                 <a href="${esc(href)}" style="color:#7A0C20;font-weight:600">${esc(t("psychologists.viewProfile"))} →</a>
               </div>`,
            );
            info.open({ map, anchor: marker });
          });
        }

        if (near) {
          markers.push(
            new maps.Marker({
              map,
              position: near,
              title: t("psychologists.youAreHere"),
              icon: {
                path: maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#1a73e8",
                fillOpacity: 1,
                strokeColor: "#fff",
                strokeWeight: 2,
              },
            }),
          );
          // Frame the visitor with the closest few pins.
          const closest = pins
            .filter((p) => p.distance_km != null)
            .sort((a, b) => a.distance_km! - b.distance_km!)
            .slice(0, 3);
          if (closest.length) {
            const b = new maps.LatLngBounds(near, near);
            closest.forEach((p) =>
              b.extend({ lat: p.map_lat, lng: p.map_lng }),
            );
            map.fitBounds(b, 48);
          }
        } else if (pins.length > 1) {
          map.fitBounds(bounds, 48);
        } else if (pins.length === 1) {
          map.setCenter(bounds.getCenter());
          map.setZoom(12);
        }
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      markers.forEach((m) => m.setMap(null));
    };
    // Rebuild when the result set or position changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins.map((p) => p.id).join(), near?.lat, near?.lng, locale]);

  if (!MAPS_API_KEY || failed) {
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
        className="h-[60vh] min-h-[360px] w-full overflow-hidden rounded-2xl border border-border"
        aria-label={t("psychologists.viewMap")}
        role="region"
      />
      <p className="text-xs text-muted-foreground">
        {t("psychologists.mapLegend").replace("{n}", String(pins.length))}
      </p>
    </div>
  );
}
