import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Schools = lazy(() => import("@/pages/center/Schools"));

export const Route = createFileRoute("/center/schools")({
  component: () => (
    <PageTransition><Schools /></PageTransition>
  ),
});
