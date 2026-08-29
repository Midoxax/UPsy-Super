import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { AdminRoute } from "@/components/AdminRoute";

const AdminAudit = lazy(() => import("@/pages/admin/Audit"));

export const Route = createFileRoute("/admin/audit")({
  head: () => ({
    meta: [
      { title: "Audit trail — U.Psy internal" },
      { name: "description", content: "Who accessed what, when, and under which data class." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <AdminRoute><PageTransition><AdminAudit /></PageTransition></AdminRoute>
  ),
});
