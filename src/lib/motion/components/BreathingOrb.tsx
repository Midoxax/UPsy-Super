import { useReducedMotionSafe } from "../hooks/useReducedMotionSafe";

interface BreathingOrbProps {
  size?: number;
  className?: string;
  intensity?: "subtle" | "default" | "strong";
}

/** The brand breath — gold/burgundy orb. 4-7-8 cadence. */
const BreathingOrb = ({ size = 220, className = "", intensity = "default" }: BreathingOrbProps) => {
  const reduced = useReducedMotionSafe();
  const opacity = intensity === "subtle" ? 0.35 : intensity === "strong" ? 0.8 : 0.55;

  return (
    <div
      aria-hidden="true"
      className={`relative pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className={reduced ? "" : "motion-breath"}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "9999px",
          background:
            "radial-gradient(circle at 50% 50%, hsl(var(--gold-accent) / 0.42), hsl(var(--burgundy) / 0.18) 55%, transparent 75%)",
          filter: "blur(24px)",
          opacity,
        }}
      />
      <div
        className={reduced ? "" : "motion-breath"}
        style={{
          position: "absolute",
          inset: "22%",
          borderRadius: "9999px",
          background:
            "radial-gradient(circle at 38% 32%, hsl(var(--gold-accent)), hsl(var(--burgundy)) 100%)",
          boxShadow: "0 0 60px hsl(var(--gold-accent) / 0.35)",
          animationDelay: "0.2s",
        }}
      />
    </div>
  );
};

export default BreathingOrb;