import { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * Lightweight cinematic hero backdrop — pure CSS + Framer Motion.
 * Replaces the @react-three/fiber HeroNetwork with a tactical
 * orbital grid, scan-sweep, and floating signal nodes.
 */
export const HeroField = () => {
  const nodes = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 6,
        dur: 4 + Math.random() * 6,
      })),
    [],
  );

  // Sparse orbital arcs (SVG paths along ellipses)
  const orbits = [
    { rx: 520, ry: 200, opacity: 0.22, dur: 60, dir: 1 },
    { rx: 720, ry: 280, opacity: 0.16, dur: 90, dir: -1 },
    { rx: 920, ry: 360, opacity: 0.1,  dur: 120, dir: 1 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Tactical grid */}
      <div className="absolute inset-0 ops-grid-bg opacity-40" />

      {/* Radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 65% 45%, hsl(var(--ops-accent) / 0.22), transparent 55%)",
        }}
      />

      {/* Orbital rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          viewBox="-1000 -500 2000 1000"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
        >
          {orbits.map((o, i) => (
            <g key={i}>
              <motion.ellipse
                cx="0"
                cy="0"
                rx={o.rx}
                ry={o.ry}
                fill="none"
                stroke={`hsl(var(--ops-accent) / ${o.opacity})`}
                strokeWidth="1"
                strokeDasharray="2 8"
                animate={{ rotate: 360 * o.dir }}
                transition={{ duration: o.dur, ease: "linear", repeat: Infinity }}
                style={{ transformOrigin: "center" }}
              />
              {/* Traveling beacon along each orbit */}
              <motion.g
                animate={{ rotate: 360 * o.dir }}
                transition={{ duration: o.dur * 0.6, ease: "linear", repeat: Infinity }}
                style={{ transformOrigin: "center" }}
              >
                <circle
                  cx={o.rx}
                  cy="0"
                  r="4"
                  fill="hsl(var(--ops-accent))"
                  style={{ filter: "drop-shadow(0 0 8px hsl(var(--ops-accent)))" }}
                />
              </motion.g>
            </g>
          ))}

          {/* Central core */}
          <motion.circle
            cx="0" cy="0" r="6"
            fill="hsl(var(--ops-accent))"
            animate={{ scale: [1, 1.4, 1], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: "drop-shadow(0 0 16px hsl(var(--ops-accent)))" }}
          />
          <circle cx="0" cy="0" r="24" fill="none" stroke="hsl(var(--ops-accent) / 0.3)" strokeWidth="1" />
          <circle cx="0" cy="0" r="48" fill="none" stroke="hsl(var(--ops-accent) / 0.15)" strokeWidth="1" />
        </svg>
      </div>

      {/* Floating signal nodes */}
      {nodes.map(n => (
        <motion.span
          key={n.id}
          className="absolute rounded-full"
          style={{
            top: `${n.top}%`,
            left: `${n.left}%`,
            width: n.size,
            height: n.size,
            background: "hsl(var(--ops-accent))",
            boxShadow: "0 0 8px hsl(var(--ops-accent))",
          }}
          animate={{
            opacity: [0, 0.9, 0],
            scale: [0.6, 1.4, 0.6],
          }}
          transition={{
            duration: n.dur,
            delay: n.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Scan sweep */}
      <motion.div
        className="absolute inset-x-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent, hsl(var(--ops-accent) / 0.08), transparent)",
        }}
        animate={{ top: ["-15%", "115%"] }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, hsl(var(--ops-bg) / 0.6) 100%)",
        }}
      />
    </div>
  );
};

export default HeroField;