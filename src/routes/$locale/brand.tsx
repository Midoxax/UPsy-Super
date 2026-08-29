import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const BrandGuidelines = lazy(() => import("@/pages/BrandGuidelines"));

export const Route = createFileRoute("/$locale/brand")({
  component: () => (
    <PageTransition><BrandGuidelines /></PageTransition>
  ),
});
