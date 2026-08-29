import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const ApplyOrganization = lazy(() => import("@/pages/apply/ApplyOrganization"));

export const Route = createFileRoute("/apply/organization")({
  component: () => (
    <PageTransition><ApplyOrganization /></PageTransition>
  ),
});
