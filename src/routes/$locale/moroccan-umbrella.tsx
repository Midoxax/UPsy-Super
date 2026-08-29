import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const MoroccanUmbrella = lazy(() => import("@/pages/MoroccanUmbrella"));

export const Route = createFileRoute("/$locale/moroccan-umbrella")({
  component: () => (
    <PageTransition><MoroccanUmbrella /></PageTransition>
  ),
});
