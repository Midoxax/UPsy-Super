import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { AdminRoute } from "@/components/AdminRoute";

const DnsChecklist = lazy(() => import("@/pages/admin/DnsChecklist"));

export const Route = createFileRoute("/admin/dns")({
  head: () => ({
    meta: [
      { title: "DNS cutover checklist — U.Psy internal" },
      { name: "description", content: "Records, TTLs, and success signals for the upsy.ma cutover." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: () => (
    <AdminRoute><PageTransition><DnsChecklist /></PageTransition></AdminRoute>
  ),
});
