import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Page = lazy(() => import("@/pages/LeagueTraining"));

export const Route = createFileRoute("/$locale/learn/lsspm")({
  component: () => (
    <PageTransition>
      <Page />
    </PageTransition>
  ),
});
