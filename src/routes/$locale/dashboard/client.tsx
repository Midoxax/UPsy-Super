import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import DashboardErrorFallback from "@/components/DashboardErrorFallback";

const PatientDashboard = lazy(() => import("@/pages/PatientDashboard"));

export const Route = createFileRoute("/$locale/dashboard/client")({
  component: () => (
    <ProtectedRoute><PageTransition><ErrorBoundary fallback={<DashboardErrorFallback />}><PatientDashboard /></ErrorBoundary></PageTransition></ProtectedRoute>
  ),
});
