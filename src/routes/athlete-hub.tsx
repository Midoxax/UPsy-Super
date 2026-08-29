import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const AthleteHub = lazy(() => import("@/pages/AthleteHub"));

export const Route = createFileRoute("/athlete-hub")({
  component: () => (
    <ProtectedRoute><PageTransition><AthleteHub /></PageTransition></ProtectedRoute>
  ),
});
