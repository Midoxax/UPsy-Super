import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const ForAthletes = lazy(() => import("@/pages/funnels/ForAthletes"));

export const Route = createFileRoute("/for-athletes")({
  component: () => (
    <PageTransition><ForAthletes /></PageTransition>
  ),
});
