import type { Variants } from "framer-motion";
import { DUR, EASE, STAGGER } from "./tokens";

/** Chapter — primary section reveal. Stagger children on view. */
export const chapter: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DUR.slow,
      ease: EASE.exhale,
      staggerChildren: STAGGER.base,
    },
  },
};

/** Child item used inside `chapter` parent. */
export const chapterItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE.exhale } },
};

/** Crystal dissolve — used by route transitions. */
export const crystalDissolve: Variants = {
  initial: { opacity: 0, scale: 1.02, filter: "blur(12px)" },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: DUR.slow, ease: EASE.exhale },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    filter: "blur(8px)",
    transition: { duration: DUR.base, ease: EASE.soft },
  },
};

/** Word mask reveal — for hero headlines. Container drives stagger. */
export const wordContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: STAGGER.base, delayChildren: 0.1 } },
};

export const wordItem: Variants = {
  hidden: { y: "110%", opacity: 0 },
  show: {
    y: "0%",
    opacity: 1,
    transition: { duration: DUR.slow, ease: EASE.exhale },
  },
};

/** Ember bloom — for success confirmations. */
export const ember: Variants = {
  hidden: { opacity: 0, scale: 0 },
  show: {
    opacity: [0, 1, 0.85],
    scale: [0, 1.3, 1],
    transition: { duration: DUR.slow, ease: EASE.glass, times: [0, 0.6, 1] },
  },
};