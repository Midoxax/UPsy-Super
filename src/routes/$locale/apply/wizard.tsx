import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const ApplyWizard = lazy(() => import("@/pages/apply/ApplyWizard"));

export const Route = createFileRoute("/$locale/apply/wizard")({
  component: () => (
    <ProtectedRoute><PageTransition><ApplyWizard /></PageTransition></ProtectedRoute>
  ),
});
