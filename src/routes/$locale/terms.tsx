import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Terms = lazy(() => import("@/pages/Terms"));

export const Route = createFileRoute("/$locale/terms")({
  component: () => (
    <PageTransition><Terms /></PageTransition>
  ),
});
