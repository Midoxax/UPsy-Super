import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const MindfulnessForBeginners = lazy(() => import("@/pages/blog/MindfulnessForBeginners"));

export const Route = createFileRoute("/blog/mindfulness-for-beginners")({
  component: () => (
    <PageTransition><MindfulnessForBeginners /></PageTransition>
  ),
});
