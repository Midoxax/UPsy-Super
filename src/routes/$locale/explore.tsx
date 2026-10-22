import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Explore = lazy(() => import("@/pages/Explore"));

export const Route = createFileRoute("/$locale/explore")({
  component: () => (
    <PageTransition>
      <Explore />
    </PageTransition>
  ),
});
