import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const About = lazy(() => import("@/pages/About"));

export const Route = createFileRoute("/$locale/about")({
  component: () => (
    <PageTransition><About /></PageTransition>
  ),
});
