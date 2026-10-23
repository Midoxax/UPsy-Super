import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { blogLoader } from "@/lib/seo/loaders";

const UnderstandingAnxiety = lazy(
  () => import("@/pages/blog/UnderstandingAnxiety"),
);

export const Route = createFileRoute("/$locale/blog/understanding-anxiety")({
  loader: () => blogLoader("understanding-anxiety"),
  component: () => (
    <PageTransition>
      <UnderstandingAnxiety />
    </PageTransition>
  ),
});
