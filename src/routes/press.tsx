import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Press = lazy(() => import("@/pages/Press"));

export const Route = createFileRoute("/press")({
  component: () => (
    <PageTransition><Press /></PageTransition>
  ),
});
