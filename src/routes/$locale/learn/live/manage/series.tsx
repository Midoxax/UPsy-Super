import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Page = lazy(() => import("@/pages/LiveSeriesManage"));

export const Route = createFileRoute("/$locale/learn/live/manage/series")({
  component: () => (
    <PageTransition>
      <Page />
    </PageTransition>
  ),
});
