/**
 * Profile shape — the geometry behind the self-score "profile form".
 *
 * One function turns the four pillar scores into a closed, smooth outline.
 * The SVG glyph and the WebGL form both read from it, so the two renderings
 * can never disagree about what a profile looks like.
 *
 * Rules this module encodes, on purpose:
 * - The shape is a description, not a verdict. Nothing here maps a score to a
 *   colour, a severity or a label.
 * - A low score shortens an axis; it never collapses it. The floor keeps the
 *   form whole so no profile reads as "broken".
 * - It is pure and takes only the scores passed in. Nothing is read from or
 *   written to storage, the network or analytics.
 */

export type ProfilePillar = "focus" | "regulation" | "recovery" | "meaning";

export type ProfileScores = Record<ProfilePillar, number>;

/**
 * Where each pillar sits, in radians, counter-clockwise from the right.
 * The order is fixed so a returning visitor always finds a pillar in the
 * same place.
 */
export const PILLAR_ANGLE: Record<ProfilePillar, number> = {
  regulation: 0, // right
  focus: Math.PI / 2, // top
  meaning: Math.PI, // left
  recovery: (3 * Math.PI) / 2, // bottom
};

export const PROFILE_PILLARS = Object.keys(PILLAR_ANGLE) as ProfilePillar[];

/** Shortest an axis can be, as a share of the full radius. */
export const PROFILE_FLOOR = 0.38;

/** Score (0–100) → axis length (PROFILE_FLOOR–1). Bad input reads as 0. */
export function axisLength(score: number): number {
  const s = Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : 0;
  return PROFILE_FLOOR + (1 - PROFILE_FLOOR) * (s / 100);
}

/**
 * Radius of the outline at angle `theta`.
 *
 * Each axis contributes cos² of its angular distance, out to 90°. With four
 * axes a quarter-turn apart the weights always sum to 1, so the curve passes
 * exactly through each axis length and four equal scores give a circle.
 */
export function profileRadius(scores: ProfileScores, theta: number): number {
  let r = 0;
  for (const p of PROFILE_PILLARS) {
    let d = Math.abs(theta - PILLAR_ANGLE[p]) % (2 * Math.PI);
    if (d > Math.PI) d = 2 * Math.PI - d;
    if (d < Math.PI / 2) r += axisLength(scores[p]) * Math.cos(d) ** 2;
  }
  return r;
}

/**
 * The outline as an SVG path, centred on (cx, cy), y pointing down as SVG
 * expects. `radius` is the length of a full-score axis.
 */
export function profilePath(
  scores: ProfileScores,
  cx: number,
  cy: number,
  radius: number,
  steps = 96,
): string {
  const parts: string[] = [];
  for (let i = 0; i < steps; i++) {
    const theta = (i / steps) * 2 * Math.PI;
    const r = profileRadius(scores, theta) * radius;
    const x = cx + r * Math.cos(theta);
    const y = cy - r * Math.sin(theta);
    parts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `${parts.join(" ")} Z`;
}
