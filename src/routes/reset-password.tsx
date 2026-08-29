import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";

const ResetPassword = lazy(() => import("@/pages/ResetPassword"));

export const Route = createFileRoute("/reset-password")({
  component: () => (
    <PageTransition><ResetPassword /></PageTransition>
  ),
});
