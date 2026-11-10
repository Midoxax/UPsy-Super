import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Page = lazy(() => import("@/pages/LiveClasses"));

export const Route = createFileRoute("/learn/live/")({
  component: () => (
    <PageTransition>
      <Page />
    </PageTransition>
  ),
});
