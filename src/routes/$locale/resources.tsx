import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Resources = lazy(() => import("@/pages/Resources"));

export const Route = createFileRoute("/$locale/resources")({
  component: () => (
    <PageTransition><Resources /></PageTransition>
  ),
});
