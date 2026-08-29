import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Apply = lazy(() => import("@/pages/Apply"));

export const Route = createFileRoute("/$locale/apply")({
  component: () => (
    <PageTransition><Apply /></PageTransition>
  ),
});
