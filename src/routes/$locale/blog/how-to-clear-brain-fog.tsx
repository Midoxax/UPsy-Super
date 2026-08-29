import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const HowToClearBrainFog = lazy(() => import("@/pages/blog/HowToClearBrainFog"));

export const Route = createFileRoute("/$locale/blog/how-to-clear-brain-fog")({
  component: () => (
    <PageTransition><HowToClearBrainFog /></PageTransition>
  ),
});
