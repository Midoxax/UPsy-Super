import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const CampaignAcademy = lazy(() => import("@/pages/campaigns/CampaignAcademy"));

export const Route = createFileRoute("/$locale/academy")({
  component: () => (
    <PageTransition>
      <CampaignAcademy />
    </PageTransition>
  ),
});
