import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Legal = lazy(() => import("@/pages/Legal"));

export const Route = createFileRoute("/$locale/legal")({
  component: () => (
    <PageTransition><Legal /></PageTransition>
  ),
});
