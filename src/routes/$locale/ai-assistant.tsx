import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import PageTransition from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const AIAssistant = lazy(() => import("@/pages/AIAssistant"));

export const Route = createFileRoute("/$locale/ai-assistant")({
  component: () => (
    <ProtectedRoute><PageTransition><AIAssistant /></PageTransition></ProtectedRoute>
  ),
});
