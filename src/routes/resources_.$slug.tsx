import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const ResourceArticle = lazy(() => import("@/pages/ResourceArticle"));

export const Route = createFileRoute("/resources_/$slug")({
  component: () => (
    <PageTransition>
      <ResourceArticle />
    </PageTransition>
  ),
});
