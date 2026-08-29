import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const HowToSupportALovedOne = lazy(() => import("@/pages/blog/HowToSupportALovedOne"));

export const Route = createFileRoute("/blog/how-to-support-a-loved-one")({
  component: () => (
    <PageTransition><HowToSupportALovedOne /></PageTransition>
  ),
});
