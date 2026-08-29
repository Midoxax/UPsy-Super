import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const MentalHealthAtWork = lazy(() => import("@/pages/blog/MentalHealthAtWork"));

export const Route = createFileRoute("/$locale/blog/mental-health-at-work")({
  component: () => (
    <PageTransition><MentalHealthAtWork /></PageTransition>
  ),
});
