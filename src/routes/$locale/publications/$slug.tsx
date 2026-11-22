import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Page = lazy(() => import("@/pages/PublicationDetail"));

export const Route = createFileRoute("/$locale/publications/$slug")({
  component: () => (
    <PageTransition>
      <Page />
    </PageTransition>
  ),
});
