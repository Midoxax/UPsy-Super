import { createFileRoute } from "@tanstack/react-router";
import OpsLanding from "@/ops/pages/Landing";
import "@/ops/ops-theme.css";

export const Route = createFileRoute("/ops/")({
  component: OpsLanding,
});
