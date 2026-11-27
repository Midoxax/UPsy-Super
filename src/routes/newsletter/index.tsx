import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Page = lazy(() => import("@/pages/Newsletter"));

export const Route = createFileRoute("/newsletter/")({
  component: () => (
    <PageTransition>
      <Page />
    </PageTransition>
  ),
});
