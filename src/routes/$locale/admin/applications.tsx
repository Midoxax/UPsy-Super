import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { AdminRoute } from "@/components/AdminRoute";

const Applications = lazy(() => import("@/pages/admin/Applications"));

export const Route = createFileRoute("/$locale/admin/applications")({
  component: () => (
    <AdminRoute><PageTransition><Applications /></PageTransition></AdminRoute>
  ),
});
