import { useEffect, useId, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

export interface AddressSelection {
  address: string;
  lat: number | null;
  lng: number | null;
}

// Photon (komoot): free OpenStreetMap address search built for
// type-ahead. Morocco only.
const PHOTON = "https://photon.komoot.io/api/";
const MOROCCO_BBOX = "-17.1,21.3,-1.0,35.95";

interface Suggestion {
  label: string;
  lat: number;
  lng: number;
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: Record<string, string | undefined>;
}

const label = (p: PhotonFeature["properties"]) =>
  [
    [p.housenumber, p.street].filter(Boolean).join(" ") || p.name,
    p.district,
    p.city ?? p.county,
  ]
    .filter((v, i, a) => v && a.indexOf(v) === i)
    .join(", ");

/**
 * Address input with suggestions from OpenStreetMap. Picking one reports
 * its coordinates; typing without picking keeps the text only. If the
 * service is unreachable it is simply a text field.
 */
export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  className,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (selection: AddressSelection) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}) {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const picked = useRef(false);
  const listId = useId();

  useEffect(() => {
    if (picked.current) {
      picked.current = false;
      return;
    }
    const q = value.trim();
    if (q.length < 3) {
      setItems([]);
      return;
    }
    const ctl = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `${PHOTON}?q=${encodeURIComponent(q)}&limit=5&bbox=${MOROCCO_BBOX}`,
          { signal: ctl.signal },
        );
        if (!res.ok) return;
        const data = (await res.json()) as { features: PhotonFeature[] };
        setItems(
          data.features
            .map((f) => ({
              label: label(f.properties),
              lng: f.geometry.coordinates[0],
              lat: f.geometry.coordinates[1],
            }))
            .filter((s) => s.label),
        );
        setOpen(true);
        setActive(-1);
      } catch {
        // Offline or blocked: plain text field.
      }
    }, 350);
    return () => {
      window.clearTimeout(timer);
      ctl.abort();
    };
  }, [value]);

  const choose = (s: Suggestion) => {
    picked.current = true;
    onChange(s.label);
    onSelect?.({ address: s.label, lat: s.lat, lng: s.lng });
    setOpen(false);
    setItems([]);
  };

  const show = open && items.length > 0;

  return (
    <div className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => items.length && setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (!show) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, items.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && active >= 0) {
            e.preventDefault();
            choose(items[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        role="combobox"
        aria-expanded={show}
        aria-controls={listId}
        aria-autocomplete="list"
      />
      {show && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover text-sm shadow-md"
        >
          {items.map((s, i) => (
            <li
              key={`${s.lat},${s.lng},${i}`}
              role="option"
              aria-selected={i === active}
              className={`cursor-pointer px-3 py-2 ${i === active ? "bg-muted" : "hover:bg-muted"}`}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(s);
              }}
            >
              {s.label}
            </li>
          ))}
          <li className="px-3 py-1 text-[10px] text-muted-foreground">
            © OpenStreetMap
          </li>
        </ul>
      )}
    </div>
  );
}
