import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const Invite = lazy(() => import("@/pages/Invite"));

export const Route = createFileRoute("/$locale/invite/$code")({
  component: () => (
    <PageTransition><Invite /></PageTransition>
  ),
});
