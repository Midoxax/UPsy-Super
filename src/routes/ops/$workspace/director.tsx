import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const Director = lazy(() => import("@/ops/pages/Director"));

export const Route = createFileRoute("/ops/$workspace/director")({
  component: () => <Director />,
});
