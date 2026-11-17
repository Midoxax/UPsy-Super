import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Page = lazy(() => import("@/pages/LiveSeriesPlayer"));

export const Route = createFileRoute("/$locale/learn/live/series/$id")({
  component: () => (
    <PageTransition>
      <Page />
    </PageTransition>
  ),
});
