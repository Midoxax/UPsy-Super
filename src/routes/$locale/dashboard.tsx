import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const RoleRouter = lazy(() => import("@/components/RoleRouter"));

export const Route = createFileRoute("/$locale/dashboard")({
  component: () => (
    <ProtectedRoute><RoleRouter /></ProtectedRoute>
  ),
});
