import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import DashboardErrorFallback from "@/components/DashboardErrorFallback";

const SpecialistDashboard = lazy(() => import("@/pages/SpecialistDashboard"));

export const Route = createFileRoute("/dashboard/specialist")({
  component: () => (
    <ProtectedRoute role="psychologist"><PageTransition><ErrorBoundary fallback={<DashboardErrorFallback />}><SpecialistDashboard /></ErrorBoundary></PageTransition></ProtectedRoute>
  ),
});
