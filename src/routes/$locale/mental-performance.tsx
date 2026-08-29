import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const MentalPerformance = lazy(() => import("@/pages/MentalPerformance"));

export const Route = createFileRoute("/$locale/mental-performance")({
  component: () => (
    <PageTransition><MentalPerformance /></PageTransition>
  ),
});
