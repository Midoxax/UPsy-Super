import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { AdminRoute } from "@/components/AdminRoute";

const AdminGrowthLeads = lazy(() => import("@/pages/admin/GrowthLeads"));

export const Route = createFileRoute("/$locale/admin/growth-leads")({
  component: () => (
    <AdminRoute><PageTransition><AdminGrowthLeads /></PageTransition></AdminRoute>
  ),
});
