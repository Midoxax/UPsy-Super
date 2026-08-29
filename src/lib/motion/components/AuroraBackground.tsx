import { useEffect, useState } from "react";

/**
 * Ambient crimson-gold aurora layer. Mount once at app root.
 * GPU-only, pauses when tab hidden.
 */
const AuroraBackground = () => {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ animationPlayState: paused ? "paused" : "running" }}
    >
      <div
        className="absolute -inset-[20%] opacity-60 motion-aurora-drift"
        style={{
          background:
            "radial-gradient(40% 35% at 22% 28%, hsl(var(--burgundy) / 0.32), transparent 60%)," +
            "radial-gradient(35% 30% at 78% 70%, hsl(var(--crimson) / 0.28), transparent 60%)," +
            "radial-gradient(50% 40% at 50% 110%, hsl(var(--gold-accent) / 0.08), transparent 60%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
};

export default AuroraBackground;