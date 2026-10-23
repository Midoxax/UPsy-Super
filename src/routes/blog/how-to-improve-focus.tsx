import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { blogLoader } from "@/lib/seo/loaders";

const HowToImproveFocus = lazy(() => import("@/pages/blog/HowToImproveFocus"));

export const Route = createFileRoute("/blog/how-to-improve-focus")({
  loader: () => blogLoader("how-to-improve-focus"),
  component: () => (
    <PageTransition>
      <HowToImproveFocus />
    </PageTransition>
  ),
});
