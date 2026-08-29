import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { AdminRoute } from "@/components/AdminRoute";

const AdminFinance = lazy(() => import("@/pages/admin/Finance"));

export const Route = createFileRoute("/admin/finance")({
  head: () => ({
    meta: [
      { title: "Finance — U.Psy internal" },
      { name: "description", content: "Invoicing, bank reconciliation and revenue ceiling tracking." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <AdminRoute><PageTransition><AdminFinance /></PageTransition></AdminRoute>
  ),
});
