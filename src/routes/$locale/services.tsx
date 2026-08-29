import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Services = lazy(() => import("@/pages/Services"));

export const Route = createFileRoute("/$locale/services")({
  component: () => (
    <PageTransition><Services /></PageTransition>
  ),
});
