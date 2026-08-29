import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const ConsultingForOrganizations = lazy(() => import("@/pages/services/ConsultingForOrganizations"));

export const Route = createFileRoute("/services/consulting-for-organizations")({
  component: () => (
    <PageTransition><ConsultingForOrganizations /></PageTransition>
  ),
});
