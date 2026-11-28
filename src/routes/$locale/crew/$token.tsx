import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Page = lazy(() => import("@/pages/CrewView"));

export const Route = createFileRoute("/$locale/crew/$token")({
  component: () => (
    <PageTransition>
      <Page />
    </PageTransition>
  ),
});
