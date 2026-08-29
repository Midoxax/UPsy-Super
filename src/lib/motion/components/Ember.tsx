import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { ember } from "../variants";

interface EmberProps {
  children: ReactNode;
  className?: string;
  /** When true, triggers the bloom. */
  active?: boolean;
}

/**
 * Ember — warm bloom confirmation. Use around success states,
 * completed steps, or earned badges. Single bloom, no loop.
 */
export default function Ember({ children, className, active = true }: EmberProps) {
  const reduced = useReducedMotion();
  if (reduced || !active) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={ember}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}