import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const WhyUs = lazy(() => import("@/pages/WhyUs"));

export const Route = createFileRoute("/why-us")({
  component: () => (
    <PageTransition><WhyUs /></PageTransition>
  ),
});
