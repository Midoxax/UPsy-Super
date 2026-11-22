import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Page = lazy(() => import("@/pages/LsspmDocuments"));

export const Route = createFileRoute("/lsspm")({
  component: () => (
    <PageTransition>
      <Page />
    </PageTransition>
  ),
});
