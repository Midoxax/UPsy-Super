import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const CampaignFirstSession = lazy(() => import("@/pages/campaigns/CampaignFirstSession"));

export const Route = createFileRoute("/campaigns/first-session")({
  component: () => (
    <PageTransition><CampaignFirstSession /></PageTransition>
  ),
});
