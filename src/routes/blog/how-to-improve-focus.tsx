import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const HowToImproveFocus = lazy(() => import("@/pages/blog/HowToImproveFocus"));

export const Route = createFileRoute("/blog/how-to-improve-focus")({
  component: () => (
    <PageTransition><HowToImproveFocus /></PageTransition>
  ),
});
