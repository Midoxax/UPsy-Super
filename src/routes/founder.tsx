import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Founder = lazy(() => import("@/pages/Founder"));

export const Route = createFileRoute("/founder")({
  component: () => (
    <PageTransition><Founder /></PageTransition>
  ),
});
