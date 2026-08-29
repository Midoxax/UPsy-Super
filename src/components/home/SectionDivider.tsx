import { memo } from "react";

type DividerVariant = "wave" | "blob" | "curve" | "zigzag";
type DividerColor = "maroon" | "gold" | "beige" | "primary" | "muted";

interface SectionDividerProps {
  variant?: DividerVariant;
  color?: DividerColor;
  flip?: boolean;
  className?: string;
}

const colorMap: Record<DividerColor, string> = {
  maroon: "hsl(var(--upsy-maroon))",
  gold: "hsl(var(--upsy-gold))",
  beige: "hsl(var(--upsy-beige))",
  primary: "hsl(var(--primary) / 0.08)",
  muted: "hsl(var(--muted))",
};

const WavePath = () => (
  <path d="M0,64 C320,120 640,0 960,64 C1280,128 1600,10 1920,64 L1920,200 L0,200 Z" />
);

const BlobPath = () => (
  <path d="M0,100 C200,20 400,140 600,80 C800,20 1000,130 1200,60 C1400,-10 1700,100 1920,50 L1920,200 L0,200 Z" />
);

const CurvePath = () => (
  <path d="M0,120 Q480,20 960,100 Q1440,180 1920,80 L1920,200 L0,200 Z" />
);

const ZigzagPath = () => (
  <path d="M0,80 L160,120 L320,60 L480,110 L640,50 L800,100 L960,40 L1120,90 L1280,30 L1440,80 L1600,20 L1760,70 L1920,10 L1920,200 L0,200 Z" />
);

const pathComponents: Record<DividerVariant, React.FC> = {
  wave: WavePath,
  blob: BlobPath,
  curve: CurvePath,
  zigzag: ZigzagPath,
};

const SectionDivider = memo(({ variant = "wave", color = "primary", flip = false, className = "" }: SectionDividerProps) => {
  const PathComponent = pathComponents[variant];
  const fill = colorMap[color];

  return (
    <div
      className={`relative w-full overflow-hidden leading-[0] ${flip ? "rotate-180" : ""} ${className}`}
      aria-hidden="true"
      style={{ marginTop: "-1px", marginBottom: "-1px" }}
    >
      <svg
        viewBox="0 0 1920 200"
        preserveAspectRatio="none"
        className="w-full h-16 md:h-24 lg:h-32"
        fill={fill}
      >
        <PathComponent />
      </svg>
    </div>
  );
});

SectionDivider.displayName = "SectionDivider";

export default SectionDivider;
export type { DividerVariant, DividerColor };