import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Page = lazy(() => import("@/pages/Trainings"));

export const Route = createFileRoute("/$locale/learn/trainings/")({
  component: () => (
    <PageTransition>
      <Page />
    </PageTransition>
  ),
});
