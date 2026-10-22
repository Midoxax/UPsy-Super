import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const CampaignLeague = lazy(() => import("@/pages/campaigns/CampaignLeague"));

export const Route = createFileRoute("/$locale/campaigns/lsspm")({
  component: () => (
    <PageTransition>
      <CampaignLeague />
    </PageTransition>
  ),
});
