import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Auth = lazy(() => import("@/pages/Auth"));

export const Route = createFileRoute("/auth")({
  component: () => (
    <PageTransition><Auth /></PageTransition>
  ),
});
