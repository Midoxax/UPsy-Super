import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const CenterHome = lazy(() => import("@/pages/center/CenterHome"));

export const Route = createFileRoute("/center")({
  component: () => (
    <PageTransition><CenterHome /></PageTransition>
  ),
});
