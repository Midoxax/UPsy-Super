import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Page = lazy(() => import("@/pages/LiveSeries"));

export const Route = createFileRoute("/$locale/learn/live/series/")({
  component: () => (
    <PageTransition>
      <Page />
    </PageTransition>
  ),
});
