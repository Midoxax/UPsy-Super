import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const FreeScore = lazy(() => import("@/pages/FreeScore"));

export const Route = createFileRoute("/free-score")({
  component: () => (
    <PageTransition><FreeScore /></PageTransition>
  ),
});
