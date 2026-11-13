import {
  PILLAR_ANGLE,
  PROFILE_PILLARS,
  axisLength,
  profilePath,
  type ProfilePillar,
  type ProfileScores,
} from "@/lib/profile/profileShape";

/**
 * ProfileGlyph — the self-score profile as a flat SVG outline.
 *
 * This is the version every visitor gets: it costs no JavaScript beyond the
 * page itself, so it works on a phone over mobile data, with reduced motion,
 * and without WebGL. The 3D form (ProfileForm) is an upgrade drawn over the
 * same geometry on devices that can afford it.
 *
 * One colour for every profile: the outline shows the shape of someone's
 * answers and never grades them.
 */

const SIZE = 240;
const C = SIZE / 2;
const R = 92;

export function ProfileGlyph({
  scores,
  className,
}: {
  scores: ProfileScores;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Full-scale ring and axes, so the outline has something to be read against. */}
      <circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        className="stroke-border"
        strokeWidth={1}
        strokeDasharray="2 5"
      />
      {PROFILE_PILLARS.map((p: ProfilePillar) => {
        const a = PILLAR_ANGLE[p];
        return (
          <line
            key={p}
            x1={C}
            y1={C}
            x2={C + R * Math.cos(a)}
            y2={C - R * Math.sin(a)}
            className="stroke-border"
            strokeWidth={1}
          />
        );
      })}
      <path
        d={profilePath(scores, C, C, R)}
        fill="var(--profile-fill, #6B1F2A)"
        fillOpacity={0.82}
        stroke="hsl(var(--gold-accent))"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* A dot where the outline meets each axis: the four values the shape
          is made of. */}
      {PROFILE_PILLARS.map((p: ProfilePillar) => {
        const a = PILLAR_ANGLE[p];
        const r = R * axisLength(scores[p]);
        return (
          <circle
            key={p}
            cx={C + r * Math.cos(a)}
            cy={C - r * Math.sin(a)}
            r={3}
            fill="hsl(var(--gold-accent))"
          />
        );
      })}
    </svg>
  );
}

export default ProfileGlyph;
