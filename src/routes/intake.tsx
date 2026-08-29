import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const IntakeForm = lazy(() => import("@/pages/IntakeForm"));

export const Route = createFileRoute("/intake")({
  component: () => (
    <ProtectedRoute><PageTransition><IntakeForm /></PageTransition></ProtectedRoute>
  ),
});
