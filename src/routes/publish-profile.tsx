import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const PublishProfile = lazy(() => import("@/pages/PublishProfile"));

export const Route = createFileRoute("/publish-profile")({
  component: () => (
    <PageTransition>
      <PublishProfile />
    </PageTransition>
  ),
});
