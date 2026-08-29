/**
 * U.Psy Motion Tokens — "Breath, Crystal, Ember"
 * Single source of truth for durations, easings, and springs.
 */

export const DUR = {
  instant: 0.12,
  quick: 0.22,
  base: 0.4,
  slow: 0.7,
  cinema: 1.2,
  breath: 19, // 4-7-8 full cycle in seconds
} as const;

export const EASE = {
  exhale: [0.22, 1, 0.36, 1] as [number, number, number, number],
  think: [0.65, 0, 0.35, 1] as [number, number, number, number],
  glass: [0.16, 1, 0.3, 1] as [number, number, number, number],
  soft: [0.4, 0, 0.2, 1] as [number, number, number, number],
} as const;

export const SPRING = {
  gentle: { stiffness: 180, damping: 22, mass: 1 },
  magnetic: { stiffness: 150, damping: 15, mass: 0.8 },
  snap: { stiffness: 280, damping: 30, mass: 1 },
  breath: { stiffness: 40, damping: 14, mass: 1.2 },
} as const;

export const STAGGER = {
  tight: 0.04,
  base: 0.08,
  loose: 0.12,
} as const;