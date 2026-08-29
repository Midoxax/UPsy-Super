import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const VideoCall = lazy(() => import("@/pages/VideoCall"));

export const Route = createFileRoute("/$locale/session/$sessionId")({
  component: () => (
    <ProtectedRoute><VideoCall /></ProtectedRoute>
  ),
});
