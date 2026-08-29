import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const SpecialistPricing = lazy(() => import("@/pages/SpecialistPricing"));

export const Route = createFileRoute("/$locale/pricing-specialists")({
  component: () => (
    <PageTransition><SpecialistPricing /></PageTransition>
  ),
});
