import { createFileRoute } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import OpsLayout from "@/ops/OpsLayout";
import "@/ops/ops-theme.css";

export const Route = createFileRoute("/ops/$workspace")({
  component: () => (
    <ProtectedRoute><OpsLayout /></ProtectedRoute>
  ),
});
