import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const Notifications = lazy(() => import("@/pages/Notifications"));

export const Route = createFileRoute("/$locale/notifications")({
  component: () => (
    <ProtectedRoute><PageTransition><Notifications /></PageTransition></ProtectedRoute>
  ),
});
