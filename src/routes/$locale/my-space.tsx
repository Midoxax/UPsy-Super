import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const MySpace = lazy(() => import("@/pages/MySpace"));

export const Route = createFileRoute("/$locale/my-space")({
  component: () => (
    <ProtectedRoute><PageTransition><MySpace /></PageTransition></ProtectedRoute>
  ),
});
