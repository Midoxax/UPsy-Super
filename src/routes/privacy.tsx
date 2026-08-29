import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Privacy = lazy(() => import("@/pages/Privacy"));

export const Route = createFileRoute("/privacy")({
  component: () => (
    <PageTransition><Privacy /></PageTransition>
  ),
});
