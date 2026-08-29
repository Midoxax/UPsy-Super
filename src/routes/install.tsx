import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Install = lazy(() => import("@/pages/Install"));

export const Route = createFileRoute("/install")({
  component: () => (
    <PageTransition><Install /></PageTransition>
  ),
});
