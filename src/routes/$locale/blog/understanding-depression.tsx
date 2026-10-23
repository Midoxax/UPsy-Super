import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { blogLoader } from "@/lib/seo/loaders";

const UnderstandingDepression = lazy(
  () => import("@/pages/blog/UnderstandingDepression"),
);

export const Route = createFileRoute("/$locale/blog/understanding-depression")({
  loader: () => blogLoader("understanding-depression"),
  component: () => (
    <PageTransition>
      <UnderstandingDepression />
    </PageTransition>
  ),
});
