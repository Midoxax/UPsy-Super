import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Pricing = lazy(() => import("@/pages/Pricing"));

export const Route = createFileRoute("/pricing")({
  component: () => (
    <PageTransition><Pricing /></PageTransition>
  ),
});
