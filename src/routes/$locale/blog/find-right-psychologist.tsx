import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const FindRightPsychologist = lazy(() => import("@/pages/blog/FindRightPsychologist"));

export const Route = createFileRoute("/$locale/blog/find-right-psychologist")({
  component: () => (
    <PageTransition><FindRightPsychologist /></PageTransition>
  ),
});
