import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const PsychologuesSansFrontieres = lazy(() => import("@/pages/PsychologuesSansFrontieres"));

export const Route = createFileRoute("/$locale/psf")({
  component: () => (
    <PageTransition><PsychologuesSansFrontieres /></PageTransition>
  ),
});
