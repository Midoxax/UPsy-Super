import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Psychologists = lazy(() => import("@/pages/Psychologists"));

export const Route = createFileRoute("/psychologists")({
  component: () => (
    <PageTransition><Psychologists /></PageTransition>
  ),
});
