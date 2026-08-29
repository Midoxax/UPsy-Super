import { motion, useReducedMotion } from "framer-motion";

interface PulseProps {
  /** Diameter in px. */
  size?: number;
  /** Tailwind color class for the dot core, e.g. "bg-emerald-500". */
  colorClass?: string;
  className?: string;
  /** Pulse cycle in seconds. */
  duration?: number;
}

/**
 * Pulse — a live status indicator. A solid dot with a soft expanding halo.
 * Respects prefers-reduced-motion (renders a static dot).
 */
export default function Pulse({
  size = 10,
  colorClass = "bg-emerald-500",
  className,
  duration = 2.2,
}: PulseProps) {
  const reduced = useReducedMotion();

  return (
    <span
      className={`relative inline-flex items-center justify-center ${className ?? ""}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {!reduced && (
        <motion.span
          className={`absolute inset-0 rounded-full ${colorClass} opacity-60`}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{ duration, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span
        className={`relative rounded-full ${colorClass}`}
        style={{ width: size, height: size }}
      />
    </span>
  );
}