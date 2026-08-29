import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Learn = lazy(() => import("@/pages/Learn"));

export const Route = createFileRoute("/learn")({
  component: () => (
    <PageTransition><Learn /></PageTransition>
  ),
});
