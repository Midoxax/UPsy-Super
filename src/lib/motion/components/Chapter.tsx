import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { chapter, chapterItem } from "../variants";

interface ChapterProps {
  children: ReactNode;
  className?: string;
  /** Amount of element in viewport before triggering (0-1). */
  amount?: number;
  /** Reveal only once. */
  once?: boolean;
  as?: "div" | "section";
}

/**
 * Chapter — primary scroll-triggered section reveal.
 * Wraps a section with the "exhale" easing and staggers direct children
 * marked with ChapterItem. Respects prefers-reduced-motion.
 */
export default function Chapter({
  children,
  className,
  amount = 0.15,
  once = true,
  as = "div",
}: ChapterProps) {
  const reduced = useReducedMotion();
  const MotionTag = as === "section" ? motion.section : motion.div;

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      variants={chapter}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
    >
      {children}
    </MotionTag>
  );
}

export function ChapterItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={chapterItem}>
      {children}
    </motion.div>
  );
}