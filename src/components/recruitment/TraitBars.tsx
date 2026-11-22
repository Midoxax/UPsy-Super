import type { Trait, TraitScore } from "@/lib/recruitment/battery";
import { useBatteryCopy } from "@/lib/recruitment/batteryCopy";

/** The six traits as 1-5 bars with their descriptive reading. */
export default function TraitBars({
  traits,
}: {
  traits: Record<Trait, TraitScore>;
}) {
  const { t, interp } = useBatteryCopy();
  return (
    <ul className="space-y-2">
      {(Object.keys(traits) as Trait[]).map((k) => {
        const s = traits[k];
        return (
          <li key={k} className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-medium">{t.traits[k]}</span>
              <span className="text-muted-foreground">
                {s.mean.toFixed(1)} / 5 · {t.levels[s.level]}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${((s.mean - 1) / 4) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {interp[k][s.level]}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
