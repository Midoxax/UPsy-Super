import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { AdminRoute } from "@/components/AdminRoute";

const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));

export const Route = createFileRoute("/admin")({
  component: () => (
    <AdminRoute><PageTransition><AdminDashboard /></PageTransition></AdminRoute>
  ),
});
