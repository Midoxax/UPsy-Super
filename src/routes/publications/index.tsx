import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Page = lazy(() => import("@/pages/Publications"));

export const Route = createFileRoute("/publications/")({
  component: () => (
    <PageTransition>
      <Page />
    </PageTransition>
  ),
});
