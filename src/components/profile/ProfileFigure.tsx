import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { canAffordWebGL } from "@/lib/motion/canAffordWebGL";
import {
  PROFILE_PILLARS,
  type ProfilePillar,
  type ProfileScores,
} from "@/lib/profile/profileShape";
import { ProfileGlyph } from "./ProfileGlyph";

const ProfileForm = lazy(() => import("@/components/three/ProfileForm"));

/**
 * ProfileFigure — "your profile, in space".
 *
 * Shows the four pillar scores as one shape with a label on each axis.
 * Everyone gets the SVG outline immediately. Visitors whose device can afford
 * WebGL (same test as the homepage orb) get the 3D form faded in over it; if
 * the 3D chunk or the GPU fails, the outline is already there and stays.
 *
 * Accessibility: the figure is one image whose text alternative lists every
 * pillar and score, so nothing is carried by the drawing alone. The page's
 * own breakdown list below it remains the full, interactive version.
 *
 * Privacy: the scores are props. This component stores nothing, sends
 * nothing and fires no analytics.
 */

// Physical placement: the figure is a diagram, so its axes do not mirror in
// RTL (hence dir="ltr" on the grid). Only the label text follows the locale.
const LABEL_CELL: Record<ProfilePillar, string> = {
  focus: "col-start-2 row-start-1 text-center pb-2",
  meaning: "col-start-1 row-start-2 self-center text-end pe-2",
  regulation: "col-start-3 row-start-2 self-center text-start ps-2",
  recovery: "col-start-2 row-start-3 text-center pt-2",
};

export function ProfileFigure({
  scores,
  labels,
  caption,
}: {
  scores: ProfileScores;
  labels: Record<ProfilePillar, string>;
  /** Short heading read out before the scores, e.g. "Your profile". */
  caption: string;
}) {
  const [show3D, setShow3D] = useState(false);
  const [active, setActive] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canAffordWebGL()) setShow3D(true);
  }, []);

  // Draw only while the figure is on screen and the tab is visible.
  useEffect(() => {
    if (!show3D || !ref.current) return;
    let onScreen = true;
    const update = () => setActive(onScreen && !document.hidden);
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      update();
    });
    io.observe(ref.current);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [show3D]);

  const alt = `${caption}: ${PROFILE_PILLARS.map(
    (p) => `${labels[p]} ${Math.round(scores[p])}`,
  ).join(", ")}`;

  const glyph = <ProfileGlyph scores={scores} className="h-full w-full" />;

  return (
    <div
      ref={ref}
      role="img"
      aria-label={alt}
      dir="ltr"
      className="mx-auto grid w-full max-w-md grid-cols-[minmax(0,1fr)_minmax(0,2.1fr)_minmax(0,1fr)] items-stretch"
    >
      <div className="relative col-start-2 row-start-2 aspect-square">
        <ErrorBoundary fallback={glyph}>
          <Suspense fallback={glyph}>
            {show3D ? <ProfileForm scores={scores} active={active} /> : glyph}
          </Suspense>
        </ErrorBoundary>
      </div>
      {PROFILE_PILLARS.map((p) => (
        <span
          key={p}
          aria-hidden="true"
          dir="auto"
          className={`text-[10px] sm:text-[11px] leading-tight uppercase tracking-[0.08em] text-muted-foreground break-words hyphens-auto ${LABEL_CELL[p]}`}
        >
          {labels[p]}
        </span>
      ))}
    </div>
  );
}

export default ProfileFigure;
