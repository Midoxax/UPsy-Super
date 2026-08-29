import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Skool = lazy(() => import("@/pages/Skool"));

export const Route = createFileRoute("/skool")({
  component: () => (
    <PageTransition><Skool /></PageTransition>
  ),
});
