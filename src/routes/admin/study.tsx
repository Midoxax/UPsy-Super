import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { AdminRoute } from "@/components/AdminRoute";

const AdminStudy = lazy(() => import("@/pages/admin/Study"));

export const Route = createFileRoute("/admin/study")({
  head: () => ({
    meta: [
      { title: "Athlete study — U.Psy internal" },
      {
        name: "description",
        content: "Enrolment and pseudonymised exports for the athlete study.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <AdminRoute>
      <PageTransition>
        <AdminStudy />
      </PageTransition>
    </AdminRoute>
  ),
});
