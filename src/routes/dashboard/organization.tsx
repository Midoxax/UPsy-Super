import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import DashboardErrorFallback from "@/components/DashboardErrorFallback";

const OrganizationDashboard = lazy(() => import("@/pages/OrganizationDashboard"));

export const Route = createFileRoute("/dashboard/organization")({
  component: () => (
    <ProtectedRoute role="organization"><PageTransition><ErrorBoundary fallback={<DashboardErrorFallback />}><OrganizationDashboard /></ErrorBoundary></PageTransition></ProtectedRoute>
  ),
});
