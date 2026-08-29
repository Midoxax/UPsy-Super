import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const PsychologistProfile = lazy(() => import("@/pages/PsychologistProfile"));

export const Route = createFileRoute("/psychologists/$id")({
  component: () => (
    <PageTransition><PsychologistProfile /></PageTransition>
  ),
});
