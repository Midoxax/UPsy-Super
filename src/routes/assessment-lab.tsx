import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const AssessmentLab = lazy(() => import("@/pages/AssessmentLab"));

export const Route = createFileRoute("/assessment-lab")({
  component: () => (
    <PageTransition><AssessmentLab /></PageTransition>
  ),
});
