import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Unsubscribe = lazy(() => import("@/pages/Unsubscribe"));

export const Route = createFileRoute("/$locale/unsubscribe")({
  component: () => (
    <PageTransition><Unsubscribe /></PageTransition>
  ),
});
