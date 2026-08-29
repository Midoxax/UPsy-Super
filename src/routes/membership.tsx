import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Membership = lazy(() => import("@/pages/Membership"));

export const Route = createFileRoute("/membership")({
  component: () => (
    <PageTransition><Membership /></PageTransition>
  ),
});
