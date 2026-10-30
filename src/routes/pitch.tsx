import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Pitch = lazy(() => import("@/pages/Pitch"));

export const Route = createFileRoute("/pitch")({
  component: () => (
    <PageTransition>
      <Pitch />
    </PageTransition>
  ),
});
