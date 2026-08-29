import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const BenefitsOnlineTherapy = lazy(() => import("@/pages/blog/BenefitsOnlineTherapy"));

export const Route = createFileRoute("/blog/benefits-online-therapy")({
  component: () => (
    <PageTransition><BenefitsOnlineTherapy /></PageTransition>
  ),
});
