import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const LearnCourse = lazy(() => import("@/pages/LearnCourse"));

export const Route = createFileRoute("/$locale/learn/$slug")({
  component: () => (
    <PageTransition><LearnCourse /></PageTransition>
  ),
});
