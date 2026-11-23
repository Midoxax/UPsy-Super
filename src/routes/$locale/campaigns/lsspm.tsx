import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const CampaignLeague = lazy(() => import("@/pages/campaigns/CampaignLeague"));

export const Route = createFileRoute("/$locale/campaigns/lsspm")({
  // No page-wide fade: the hero heading is this page's largest content and
  // must paint at once; the page animates its own sections.
  component: () => <CampaignLeague />,
});
