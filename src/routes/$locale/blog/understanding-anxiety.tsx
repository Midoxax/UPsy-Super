import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const UnderstandingAnxiety = lazy(() => import("@/pages/blog/UnderstandingAnxiety"));

export const Route = createFileRoute("/$locale/blog/understanding-anxiety")({
  component: () => (
    <PageTransition><UnderstandingAnxiety /></PageTransition>
  ),
});
