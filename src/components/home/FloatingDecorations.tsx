import { memo } from "react";
import { motion } from "framer-motion";

type DecorationPreset = "hero" | "clinical" | "warm" | "neural" | "minimal";

interface FloatingDecorationsProps {
  preset?: DecorationPreset;
  className?: string;
}

interface Shape {
  type: "circle" | "triangle" | "dot" | "ring" | "cross";
  x: string;
  y: string;
  size: number;
  color: string;
  duration: number;
  delay: number;
  rotation?: number;
}

// Respect prefers-reduced-motion
const prefersReducedMotion =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const presets: Record<DecorationPreset, Shape[]> = {
  hero: [
    { type: "circle", x: "5%", y: "15%", size: 80, color: "hsl(var(--upsy-maroon) / 0.12)", duration: 8, delay: 0 },
    { type: "ring", x: "88%", y: "12%", size: 60, color: "hsl(var(--upsy-gold) / 0.2)", duration: 10, delay: 1 },
    { type: "triangle", x: "92%", y: "70%", size: 24, color: "hsl(var(--upsy-maroon) / 0.15)", duration: 7, delay: 0.5, rotation: 30 },
    { type: "dot", x: "8%", y: "75%", size: 10, color: "hsl(var(--upsy-gold) / 0.25)", duration: 5, delay: 2 },
    { type: "cross", x: "75%", y: "85%", size: 16, color: "hsl(var(--primary) / 0.1)", duration: 9, delay: 1.5 },
    { type: "triangle", x: "15%", y: "50%", size: 18, color: "hsl(var(--upsy-gold) / 0.12)", duration: 11, delay: 0.8, rotation: -15 },
    { type: "dot", x: "60%", y: "8%", size: 8, color: "hsl(var(--upsy-maroon) / 0.1)", duration: 6, delay: 3 },
    { type: "ring", x: "30%", y: "88%", size: 40, color: "hsl(var(--primary) / 0.06)", duration: 12, delay: 2.5 },
  ],
  clinical: [
    { type: "circle", x: "90%", y: "20%", size: 50, color: "hsl(var(--primary) / 0.08)", duration: 9, delay: 0 },
    { type: "dot", x: "5%", y: "60%", size: 8, color: "hsl(var(--upsy-gold) / 0.2)", duration: 6, delay: 1 },
    { type: "triangle", x: "85%", y: "75%", size: 20, color: "hsl(var(--upsy-maroon) / 0.1)", duration: 8, delay: 0.5, rotation: 45 },
    { type: "ring", x: "10%", y: "25%", size: 35, color: "hsl(var(--primary) / 0.06)", duration: 10, delay: 2 },
  ],
  warm: [
    { type: "circle", x: "85%", y: "15%", size: 90, color: "hsl(var(--upsy-gold) / 0.1)", duration: 10, delay: 0 },
    { type: "triangle", x: "8%", y: "80%", size: 22, color: "hsl(var(--upsy-maroon) / 0.12)", duration: 7, delay: 1, rotation: 60 },
    { type: "dot", x: "50%", y: "5%", size: 12, color: "hsl(var(--upsy-gold) / 0.15)", duration: 8, delay: 0.5 },
    { type: "cross", x: "92%", y: "60%", size: 14, color: "hsl(var(--primary) / 0.08)", duration: 9, delay: 2 },
  ],
  neural: [
    { type: "ring", x: "15%", y: "20%", size: 45, color: "hsl(var(--primary) / 0.08)", duration: 11, delay: 0 },
    { type: "dot", x: "80%", y: "30%", size: 6, color: "hsl(var(--upsy-gold) / 0.2)", duration: 5, delay: 1 },
    { type: "dot", x: "70%", y: "70%", size: 8, color: "hsl(var(--upsy-maroon) / 0.12)", duration: 6, delay: 2 },
    { type: "circle", x: "25%", y: "75%", size: 30, color: "hsl(var(--primary) / 0.05)", duration: 12, delay: 0.5 },
    { type: "cross", x: "55%", y: "15%", size: 12, color: "hsl(var(--upsy-gold) / 0.1)", duration: 8, delay: 3 },
  ],
  minimal: [
    { type: "dot", x: "90%", y: "25%", size: 6, color: "hsl(var(--primary) / 0.1)", duration: 7, delay: 0 },
    { type: "dot", x: "10%", y: "70%", size: 8, color: "hsl(var(--upsy-gold) / 0.15)", duration: 8, delay: 1.5 },
  ],
};

function renderShape(shape: Shape, index: number) {
  const floatAnim = prefersReducedMotion
    ? { opacity: 0.7 }
    : {
        y: [0, -12, 0, 8, 0],
        rotate: shape.rotation ? [0, shape.rotation / 4, 0, -shape.rotation / 4, 0] : undefined,
        opacity: [0.6, 1, 0.8, 1, 0.6],
      };

  const floatTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: shape.duration, delay: shape.delay, repeat: Infinity, ease: "easeInOut" as const };

  const common = {
    className: "absolute pointer-events-none",
    style: { left: shape.x, top: shape.y } as React.CSSProperties,
    animate: floatAnim,
    transition: floatTransition,
  };

  switch (shape.type) {
    case "circle":
      return (
        <motion.div key={index} {...common}>
          <svg width={shape.size} height={shape.size} viewBox="0 0 100 100" role="presentation">
            <circle cx="50" cy="50" r="45" fill={shape.color} />
          </svg>
        </motion.div>
      );
    case "ring":
      return (
        <motion.div key={index} {...common}>
          <svg width={shape.size} height={shape.size} viewBox="0 0 100 100" role="presentation">
            <circle cx="50" cy="50" r="40" fill="none" stroke={shape.color} strokeWidth="6" />
          </svg>
        </motion.div>
      );
    case "triangle":
      return (
        <motion.div key={index} {...common}>
          <svg width={shape.size} height={shape.size} viewBox="0 0 100 100" role="presentation">
            <polygon points="50,10 90,90 10,90" fill={shape.color} />
          </svg>
        </motion.div>
      );
    case "dot":
      return (
        <motion.div key={index} {...common}>
          <svg width={shape.size} height={shape.size} viewBox="0 0 100 100" role="presentation">
            <circle cx="50" cy="50" r="50" fill={shape.color} />
          </svg>
        </motion.div>
      );
    case "cross":
      return (
        <motion.div key={index} {...common}>
          <svg width={shape.size} height={shape.size} viewBox="0 0 100 100" role="presentation">
            <line x1="20" y1="20" x2="80" y2="80" stroke={shape.color} strokeWidth="8" strokeLinecap="round" />
            <line x1="80" y1="20" x2="20" y2="80" stroke={shape.color} strokeWidth="8" strokeLinecap="round" />
          </svg>
        </motion.div>
      );
    default:
      return null;
  }
}

const FloatingDecorations = memo(({ preset = "minimal", className = "" }: FloatingDecorationsProps) => {
  const shapes = presets[preset];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none hidden md:block ${className}`} aria-hidden="true">
      {shapes.map((shape, i) => renderShape(shape, i))}
    </div>
  );
});

FloatingDecorations.displayName = "FloatingDecorations";

export default FloatingDecorations;
export type { DecorationPreset };
