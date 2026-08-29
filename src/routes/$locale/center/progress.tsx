import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const CenterProgress = lazy(() => import("@/pages/center/Progress"));

export const Route = createFileRoute("/$locale/center/progress")({
  component: () => (
    <ProtectedRoute><PageTransition><CenterProgress /></PageTransition></ProtectedRoute>
  ),
});
