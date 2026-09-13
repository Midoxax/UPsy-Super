import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Soleterre = lazy(() => import("@/pages/Soleterre"));

export const Route = createFileRoute("/soleterre")({
  component: () => (
    <PageTransition><Soleterre /></PageTransition>
  ),
});
