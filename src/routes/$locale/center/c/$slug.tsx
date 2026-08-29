import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const SpaceView = lazy(() => import("@/pages/center/SpaceView"));

export const Route = createFileRoute("/$locale/center/c/$slug")({
  component: () => (
    <PageTransition><SpaceView /></PageTransition>
  ),
});
