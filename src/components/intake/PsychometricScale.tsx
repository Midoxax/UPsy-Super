import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ScaleItem {
  id: number;
  text: string;
  reversed?: boolean;
}

export interface ScaleConfig {
  id: string;
  title: string;
  instruction: string;
  items: ScaleItem[];
  options: { value: number; label: string }[];
  scoringBands: { min: number; max: number; label: string; color: string }[];
  onCrisisItem?: (itemId: number, value: number) => void;
  crisisItemId?: number;
}

interface Props {
  config: ScaleConfig;
  values: Record<number, number>;
  onChange: (itemId: number, value: number) => void;
  disabled?: boolean;
}

export const computeScaleScore = (
  items: ScaleItem[],
  values: Record<number, number>,
  maxOption: number,
): number => {
  let total = 0;
  for (const item of items) {
    const v = values[item.id];
    if (v == null) continue;
    total += item.reversed ? maxOption - v : v;
  }
  return total;
};

export const getSeverity = (
  score: number,
  bands: ScaleConfig["scoringBands"],
): { label: string; color: string } => {
  for (const b of bands) {
    if (score >= b.min && score <= b.max) return { label: b.label, color: b.color };
  }
  return { label: "", color: "" };
};

const PsychometricScale = ({ config, values, onChange, disabled }: Props) => {
  const answeredCount = Object.keys(values).filter((k) => values[Number(k)] != null).length;
  const allAnswered = answeredCount === config.items.length;
  const maxOpt = Math.max(...config.options.map((o) => o.value));
  const score = computeScaleScore(config.items, values, maxOpt);
  const severity = allAnswered ? getSeverity(score, config.scoringBands) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{config.title}</h3>
        {allAnswered && severity && (
          <Badge variant="outline" className="text-[10px]">
            {score} — {severity.label}
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground italic">{config.instruction}</p>

      {/* Column headers for options */}
      <div className="hidden sm:grid gap-1" style={{ gridTemplateColumns: `1fr repeat(${config.options.length}, 80px)` }}>
        <div />
        {config.options.map((o) => (
          <div key={o.value} className="text-[10px] text-center text-muted-foreground leading-tight">
            {o.label}
          </div>
        ))}
      </div>

      {config.items.map((item) => {
        const isCrisis = config.crisisItemId === item.id;
        return (
          <Card
            key={item.id}
            className={cn(
              "border",
              isCrisis && "border-destructive/40 bg-destructive/5",
            )}
          >
            <CardContent className="p-3 space-y-2">
              <p className={cn("text-xs leading-relaxed", isCrisis && "font-medium")}>
                {item.id}. {item.text}
              </p>
              {isCrisis && (
                <p className="text-[10px] text-destructive/80 italic">
                  Cette question est sensible. Si tu réponds, ton psy en sera informé·e pour t'accompagner en priorité.
                </p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {config.options.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onChange(item.id, o.value);
                      if (isCrisis && o.value >= 1) {
                        config.onCrisisItem?.(item.id, o.value);
                      }
                    }}
                    className={cn(
                      "text-[11px] px-2.5 py-1.5 rounded-md border transition-colors",
                      values[item.id] === o.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-muted/60",
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {allAnswered && (
        <div className="rounded-lg border p-3 text-center">
          <div className="text-lg font-bold">{score}</div>
          {severity && (
            <div className="text-xs text-muted-foreground">{severity.label}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default PsychometricScale;