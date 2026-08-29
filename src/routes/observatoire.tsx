import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Observatoire = lazy(() => import("@/pages/Observatoire"));

export const Route = createFileRoute("/observatoire")({
  component: () => (
    <PageTransition><Observatoire /></PageTransition>
  ),
});
