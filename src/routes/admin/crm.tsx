import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { AdminRoute } from "@/components/AdminRoute";

const AdminCRM = lazy(() => import("@/pages/admin/CRM"));

export const Route = createFileRoute("/admin/crm")({
  head: () => ({
    meta: [
      { title: "CRM — U.Psy internal" },
      { name: "description", content: "Internal acquisition and contact command surface." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <AdminRoute><PageTransition><AdminCRM /></PageTransition></AdminRoute>
  ),
});
