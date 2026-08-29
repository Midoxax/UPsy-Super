import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const MfaSetup = lazy(() => import("@/pages/MfaSetup"));

export const Route = createFileRoute("/auth/mfa-setup")({
  component: () => (
    <ProtectedRoute><PageTransition><MfaSetup /></PageTransition></ProtectedRoute>
  ),
});
