import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const TalentInnovationHub = lazy(() => import("@/pages/TalentInnovationHub"));

export const Route = createFileRoute("/$locale/talent-innovation-hub")({
  component: () => (
    <PageTransition><TalentInnovationHub /></PageTransition>
  ),
});
