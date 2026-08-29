import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const ForOrganizations = lazy(() => import("@/pages/funnels/ForOrganizations"));

export const Route = createFileRoute("/$locale/for-organizations")({
  component: () => (
    <PageTransition><ForOrganizations /></PageTransition>
  ),
});
