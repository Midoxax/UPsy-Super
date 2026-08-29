import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const CampaignJoinSpecialist = lazy(() => import("@/pages/campaigns/CampaignJoinSpecialist"));

export const Route = createFileRoute("/campaigns/join-specialist")({
  component: () => (
    <PageTransition><CampaignJoinSpecialist /></PageTransition>
  ),
});
